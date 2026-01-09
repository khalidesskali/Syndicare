from django.db import models
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from myapp.models import ResidentPayment, Payment, Subscription, SubscriptionPlan
from myapp.permissions import IsAdminOrSyndic
from myapp.serializers import PaymentSerializer


class SyndicPaymentViewSet(viewsets.ModelViewSet):
    """
    Admin and Syndic can:
    - List syndic subscription payments
    - Create new payments for subscriptions (syndic only)
    - Confirm a payment (admin only)
    - Reject a payment (admin only)
    """

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSyndic]

    def get_queryset(self):
        # For listing, show syndic subscription payments (not resident payments)
        # Swagger safety
        if getattr(self, "swagger_fake_view", False):
            return Payment.objects.none()
        
        user = self.request.user
        
        # If this is a create action, we don't need queryset
        if self.action == 'create':
            return Payment.objects.none()
            
        # For list/retrieve actions, show syndic subscription payments
        if user.is_admin:
            # Admin can see all syndic payments
            return Payment.objects.all().select_related(
                'subscription', 'subscription__plan', 'processed_by'
            )
        else:
            # Syndic can only see their own payments
            return Payment.objects.filter(
                subscription__syndic_profile__user=user
            ).select_related(
                'subscription', 'subscription__plan', 'processed_by'
            )

    def create(self, request, *args, **kwargs):
        """
        Create a new payment for syndic subscription
        POST /api/syndic/payments/
        """
        subscription_id = request.data.get('subscription_id')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        reference = request.data.get('reference', '')
        notes = request.data.get('notes', '')
        rib = request.data.get('rib', '')
        payment_proof = request.FILES.get('payment_proof')

        if not subscription_id or not amount or not payment_method:
            return Response({
                'success': False,
                'message': 'Subscription ID, amount, and payment method are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get subscription - ensure it belongs to the current syndic
            try:
                subscription = Subscription.objects.get(
                    id=subscription_id,
                    syndic_profile__user=request.user
                )
            except Subscription.DoesNotExist:
                # If subscription doesn't exist, check if it's a plan ID instead
                try:
                    plan = SubscriptionPlan.objects.get(id=subscription_id)
                    # Get or create syndic profile
                    syndic_profile = request.user.syndic_profile
                    
                    # Check if syndic already has a subscription and extend it
                    try:
                        existing_subscription = Subscription.objects.get(syndic_profile=syndic_profile)
                        # Extend existing subscription by adding new plan's duration to current end date
                        existing_subscription.plan = plan
                        existing_subscription.end_date = existing_subscription.end_date + timezone.timedelta(days=plan.duration_days)
                        existing_subscription.status = 'ACTIVE'
                        existing_subscription.save()
                        subscription = existing_subscription
                    except Subscription.DoesNotExist:
                        # Create a new subscription for this syndic
                        subscription = Subscription.objects.create(
                            syndic_profile=syndic_profile,
                            plan=plan,
                            start_date=timezone.now().date(),
                            end_date=timezone.now().date() + timezone.timedelta(days=plan.duration_days),
                            status='ACTIVE'
                        )
                except SubscriptionPlan.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Subscription plan not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Create payment
            payment = Payment.objects.create(
                subscription=subscription,
                amount=amount,
                payment_method=payment_method,
                reference=reference,
                notes=notes,
                rib=rib,
                payment_proof=payment_proof,
                status='PENDING'
            )

            serializer = PaymentSerializer(payment)
            return Response({
                'success': True,
                'message': 'Payment created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error creating payment: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    # -----------------------------
    # CONFIRM PAYMENT
    # -----------------------------
    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        payment = self.get_object()

        if payment.status != "PENDING":
            return Response(
                {"message": "Only pending payments can be confirmed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.status = "CONFIRMED"
        payment.confirmed_at = timezone.now()
        payment.save()

        # Update charge status if this is a resident payment
        if hasattr(payment, 'charge'):
            self._update_charge_status(payment.charge)

        return Response(
            {
                "success": True,
                "message": "Payment confirmed successfully",
                "data": {
                    "payment_id": payment.id,
                    "payment_status": payment.status,
                }
            },
            status=status.HTTP_200_OK
        )

    # -----------------------------
    # REJECT PAYMENT
    # -----------------------------
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        payment = self.get_object()
        reason = request.data.get("reason")

        if payment.status != "PENDING":
            return Response(
                {"message": "Only pending payments can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.status = "REJECTED"
        payment.confirmed_at = timezone.now()
        payment.save()

        return Response(
            {
                "success": True,
                "message": "Payment rejected",
                "data": {
                    "payment_id": payment.id,
                    "payment_status": payment.status,
                    "reason": reason,
                }
            },
            status=status.HTTP_200_OK
        )

    # -----------------------------
    # INTERNAL HELPER (CRITICAL)
    # -----------------------------
    def _update_charge_status(self, charge):
        """
        Recalculate charge status based ONLY on CONFIRMED payments
        """

        confirmed_total = charge.payments.filter(
            status="CONFIRMED"
        ).aggregate(
            total=models.Sum("amount")
        )["total"] or 0

        charge.paid_amount = confirmed_total

        if confirmed_total >= charge.amount:
            charge.status = "PAID"
        elif confirmed_total > 0:
            charge.status = "PARTIALLY_PAID"
        else:
            charge.status = "UNPAID"

        charge.save(update_fields=["paid_amount", "status"])