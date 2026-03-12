from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from datetime import datetime

from .models import Charge, ChargePayment
from .serializers import ChargeSerializer, ChargePaymentSerializer
from apps.users.permissions import IsSyndic, IsResident
from apps.users.models import Notification
from apps.apartments.models import Appartement
from apps.buildings.models import Immeuble

class ChargeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing charges by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ChargeSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Charge.objects.none()
            
        return Charge.objects.filter(
            appartement__immeuble__syndic=self.request.user
        ).select_related('appartement', 'appartement__immeuble')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        status_filter = request.query_params.get('status')
        building_id = request.query_params.get('building_id')
        search = request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if building_id:
            queryset = queryset.filter(appartement__immeuble_id=building_id)
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(appartement__number__icontains=search)
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        apartment_id = request.data.get('appartement')
        if not self._verify_apartment_ownership(apartment_id):
            return Response({
                'success': False,
                'message': 'You do not manage this apartment'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        charge = serializer.save(status='UNPAID')

        apartment = charge.appartement
        if apartment.resident:
            Notification.objects.create(
                recipient=apartment.resident,
                title='New Charge Created',
                message=f'A new charge "{charge.description}" of {charge.amount} DH has been created for your apartment.',
                type='CHARGE_CREATED',
                related_entity_id=charge.id
            )

        return Response({
            'success': True,
            'message': 'Charge created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        charge = self.get_object()
        serializer = self.get_serializer(charge)

        payments = ChargePayment.objects.filter(charge=charge).select_related('resident')
        payments_data = [{
            'id': p.id,
            'resident': p.resident.email,
            'amount': float(p.amount),
            'method': p.payment_method,
            'status': p.status,
            'reference': p.reference,
            'paid_at': p.paid_at,
            'confirmed_at': p.confirmed_at
        } for p in payments]

        return Response({
            'success': True,
            'data': serializer.data,
            'payments': payments_data
        })

    def update(self, request, pk=None):
        charge = self.get_object()
        serializer = self.get_serializer(charge, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Charge updated successfully',
            'data': serializer.data
        })

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        charge = self.get_object()
        if charge.payments.exists():
            return Response({
                'success': False,
                'message': 'Cannot delete a charge with payments'
            }, status=status.HTTP_400_BAD_REQUEST)
        charge.delete()
        return Response({
            'success': True,
            'message': 'Charge deleted successfully'
        })

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        building_id = request.data.get('building_id')
        description = request.data.get('description')
        due_date_str = request.data.get('due_date')

        if not all([building_id, description, due_date_str]):
            return Response({'success': False, 'message': 'Missing fields'}, status=400)

        if not self._verify_building_ownership(building_id):
            return Response({'success': False, 'message': 'Permission denied'}, status=403)

        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        apartments = Appartement.objects.filter(immeuble_id=building_id)

        with transaction.atomic():
            for apartment in apartments:
                charge = Charge.objects.create(
                    appartement=apartment,
                    description=description,
                    amount=apartment.monthly_charge,
                    due_date=due_date,
                    status='UNPAID'
                )
                if apartment.resident:
                    Notification.objects.create(
                        recipient=apartment.resident,
                        title='New Charge Created',
                        message=f'A new charge "{charge.description}" of {charge.amount} DH has been created for your apartment.',
                        type='CHARGE_CREATED',
                        related_entity_id=charge.id
                    )

        return Response({'success': True, 'message': f'{apartments.count()} charges created'}, status=201)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        queryset = self.get_queryset()
        today = timezone.now().date()
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        confirmed_payments = ChargePayment.objects.filter(charge__in=queryset, status='CONFIRMED').aggregate(total=Sum('amount'))['total'] or 0
        
        unpaid_amount = 0
        for charge in queryset.exclude(status='PAID'):
            paid = charge.payments.filter(status='CONFIRMED').aggregate(total=Sum('amount'))['total'] or 0
            unpaid_amount += max(charge.amount - paid, 0)

        stats = {
            'total_charges': queryset.count(),
            'paid': queryset.filter(status='PAID').count(),
            'partially_paid': queryset.filter(status='PARTIALLY_PAID').count(),
            'unpaid': queryset.filter(status='UNPAID').count(),
            'overdue': queryset.filter(status__in=['UNPAID', 'PARTIALLY_PAID'], due_date__lt=today).count(),
            'total_amount': float(total_amount),
            'paid_amount': float(confirmed_payments),
            'unpaid_amount': float(unpaid_amount),
            'collection_rate': round((confirmed_payments / total_amount * 100), 1) if total_amount else 0
        }
        return Response({'success': True, 'data': stats})

    def _verify_apartment_ownership(self, apartment_id):
        return Appartement.objects.filter(id=apartment_id, immeuble__syndic=self.request.user).exists()

    def _verify_building_ownership(self, building_id):
        return Immeuble.objects.filter(id=building_id, syndic=self.request.user).exists()


class ResidentChargeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Residents to view their charges
    """
    permission_classes = [IsAuthenticated, IsResident]
    serializer_class = ChargeSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Charge.objects.none()
        return Charge.objects.filter(appartement__resident=self.request.user).select_related('appartement', 'appartement__immeuble')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'count': queryset.count(), 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def pay_submit(self, request, pk=None):
        charge = self.get_object()
        if charge.appartement.resident != request.user:
            return Response({"success": False, "message": "Permission denied"}, status=403)
        if charge.status == "PAID":
            return Response({"success": False, "message": "Already paid"}, status=400)
        
        payment_method = request.data.get("payment_method")
        reference = request.data.get("reference")
        if not payment_method:
            return Response({"success": False, "message": "Payment method required"}, status=400)

        amount = charge.amount - charge.paid_amount
        payment = ChargePayment.objects.create(
            resident=request.user,
            syndic=charge.appartement.immeuble.syndic,
            appartement=charge.appartement,
            charge=charge,
            amount=amount,
            payment_method=payment_method,
            reference=reference,
            paid_at=timezone.now(),
            status="PENDING"
        )
        charge.paid_amount += amount
        charge.save(update_fields=["paid_amount"])

        try:
            Notification.objects.create(
                recipient=charge.appartement.immeuble.syndic,
                title="Payment Submitted",
                message=f"{request.user.first_name} {request.user.last_name} submitted a payment for {charge.description}",
                type="SYSTEM",
                related_entity_id=charge.id
            )
        except: pass
        
        return Response({"success": True, "message": "Payment submitted", "data": {"payment_id": payment.id}}, status=201)


class ResidentPaymentViewSet(viewsets.ViewSet):
    """
    ViewSet for residents to view their payments
    """
    permission_classes = [IsAuthenticated, IsResident]
    
    def list(self, request):
        payments = ChargePayment.objects.filter(resident=request.user).select_related('charge', 'appartement', 'syndic')
        serializer = ChargePaymentSerializer(payments, many=True)
        return Response({'success': True, 'count': payments.count(), 'payments': serializer.data})

    def retrieve(self, request, pk=None):
        payment = get_object_or_404(ChargePayment, pk=pk, resident=request.user)
        return Response({'success': True, 'payment': ChargePaymentSerializer(payment).data})


class SyndicResidentPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Syndic to manage payments
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ChargePaymentSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ChargePayment.objects.none()
        return ChargePayment.objects.filter(syndic=self.request.user).select_related('resident', 'charge', 'appartement')

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        if payment.status != 'PENDING':
            return Response({'success': False, 'message': 'Not pending'}, status=400)
        
        payment.status = 'CONFIRMED'
        payment.confirmed_at = timezone.now()
        payment.save()

        charge = payment.charge
        self._sync_charge_status(charge)

        Notification.objects.create(
            recipient=payment.resident,
            title='Payment Confirmed',
            message=f'Your payment of {payment.amount} DH for "{charge.description}" has been confirmed.',
            type='PAYMENT_CONFIRMED',
            related_entity_id=charge.id
        )
        return Response({'success': True, 'message': 'Confirmed', 'data': self.get_serializer(payment).data})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        payment = self.get_object()
        if payment.status != 'PENDING':
            return Response({'success': False, 'message': 'Not pending'}, status=400)

        reason = request.data.get('reason', 'Rejected')
        payment.status = 'REJECTED'
        payment.notes = f"{payment.notes}\nRejected: {reason}"
        payment.save()

        charge = payment.charge
        charge.paid_amount -= payment.amount
        charge.save()
        self._sync_charge_status(charge)

        Notification.objects.create(
            recipient=payment.resident,
            title='Payment Rejected',
            message=f'Your payment for "{charge.description}" was rejected.',
            type='SYSTEM',
            related_entity_id=charge.id
        )
        return Response({'success': True, 'message': 'Rejected', 'data': self.get_serializer(payment).data})

    def _sync_charge_status(self, charge):
        confirmed_total = charge.payments.filter(status='CONFIRMED').aggregate(total=Sum('amount'))['total'] or 0
        if confirmed_total >= charge.amount:
            charge.status = 'PAID'
        elif confirmed_total > 0:
            charge.status = 'PARTIALLY_PAID'
        else:
            charge.status = 'UNPAID'
        charge.save(update_fields=['status'])
