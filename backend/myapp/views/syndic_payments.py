from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from ..models import ChargePayment, Notification
from ..serializers import ChargePaymentSerializer
from ..permissions import IsSyndic

class SyndicResidentPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Syndic to manage payments from Residents
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ChargePaymentSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ChargePayment.objects.none()
            
        return ChargePayment.objects.filter(
            syndic=self.request.user
        ).select_related('resident', 'charge', 'appartement')

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status != 'PENDING':
            return Response({
                'success': False,
                'message': f'Payment is already {payment.status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        payment.status = 'CONFIRMED'
        payment.confirmed_at = timezone.now()
        payment.save()

        # Update charge status logic - usually handled by _recalculate_charge_status in ChargeViewSet
        # But we can trigger it here if we want to be safe
        charge = payment.charge
        # Re-calculate status (PAID if total confirmed >= amount)
        self._sync_charge_status(charge)

        # Notify the resident
        Notification.objects.create(
            recipient=payment.resident,
            title='Payment Confirmed',
            message=f'Your payment of {payment.amount} DH for "{charge.description}" has been confirmed.',
            type='PAYMENT_CONFIRMED',
            related_entity_id=charge.id
        )

        return Response({
            'success': True,
            'message': 'Payment confirmed successfully',
            'data': self.get_serializer(payment).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status != 'PENDING':
            return Response({
                'success': False,
                'message': 'Can only reject pending payments'
            }, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', 'Payment verification failed')
        payment.status = 'REJECTED'
        payment.notes = f"{payment.notes}\nRejected: {reason}"
        payment.save()

        # Update charge amount (reverse the claim)
        charge = payment.charge
        charge.paid_amount -= payment.amount
        charge.save()
        self._sync_charge_status(charge)

        # Notify the resident
        Notification.objects.create(
            recipient=payment.resident,
            title='Payment Rejected',
            message=f'Your payment for "{charge.description}" was rejected. Reason: {reason}',
            type='SYSTEM',
            related_entity_id=charge.id
        )

        return Response({
            'success': True,
            'message': 'Payment rejected successfully',
            'data': self.get_serializer(payment).data
        })

    def _sync_charge_status(self, charge):
        from django.db.models import Sum
        confirmed_total = charge.payments.filter(
            status='CONFIRMED'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        if confirmed_total >= charge.amount:
            charge.status = 'PAID'
        elif confirmed_total > 0:
            charge.status = 'PARTIALLY_PAID'
        else:
            charge.status = 'UNPAID'
        
        charge.save(update_fields=['status'])
