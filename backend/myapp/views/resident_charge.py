from decimal import Decimal, InvalidOperation

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from myapp.models import Charge, ResidentPayment
from myapp.permissions import IsResident
from myapp.serializers import ChargeSerializer


class ResidentChargeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Resident can:
    - List all charges for ALL of their apartments
    - Retrieve a single charge
    - Pay a charge (creates a ResidentPayment)
    """

    serializer_class = ChargeSerializer
    permission_classes = [IsAuthenticated, IsResident]

    def get_queryset(self):
        # Swagger / schema generation fix
        if getattr(self, "swagger_fake_view", False):
            return Charge.objects.none()
    
        user = self.request.user
    
        if not user.is_authenticated:
            return Charge.objects.none()
    
        return Charge.objects.filter(appartement__resident=user)
    
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """
        POST /api/resident/charges/{id}/pay/

        Body:
        {
            "amount": 300,
            "payment_method": "BANK_TRANSFER",
            "reference": "BMCE-2394023",
            "paid_at": "2026-01-01"   # optional
        }
        """

        charge = self.get_object()
        user = request.user

        # Ownership check (multi-apartment safe)
        if charge.appartement.resident != user:
            return Response(
                {
                    "success": False,
                    "message": "You do not have permission to pay this charge"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if charge.status == "PAID":
            return Response(
                {
                    "success": False,
                    "message": "This charge is already fully paid"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method")
        reference = request.data.get("reference")
        paid_at = request.data.get("paid_at")

        if amount is None or payment_method is None:
            return Response(
                {
                    "success": False,
                    "message": "Amount and payment_method are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, TypeError):
            return Response(
                {
                    "success": False,
                    "message": "Invalid amount format"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount <= 0:
            return Response(
                {
                    "success": False,
                    "message": "Payment amount must be greater than zero"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        remaining_amount = charge.amount - charge.paid_amount

        if amount > remaining_amount:
            return Response(
                {
                    "success": False,
                    "message": "Payment exceeds remaining charge amount"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if paid_at:
            try:
                paid_at = timezone.datetime.fromisoformat(paid_at)
            except ValueError:
                return Response(
                    {
                        "success": False,
                        "message": "Invalid paid_at format (ISO 8601 required)"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            paid_at = timezone.now()

        payment = ResidentPayment.objects.create(
            resident=user,
            syndic=charge.appartement.immeuble.syndic,
            appartement=charge.appartement,
            charge=charge,
            amount=amount,
            payment_method=payment_method,
            reference=reference,
            paid_at=paid_at,
            status="PENDING"
        )

        return Response(
            {
                "success": True,
                "message": "Payment submitted and awaiting syndic confirmation",
                "data": {
                    "payment_id": payment.id,
                    "charge_id": charge.id,
                    "amount": float(payment.amount),
                    "remaining_amount": float(remaining_amount - amount),
                    "payment_status": payment.status
                }
            },
            status=status.HTTP_201_CREATED
        )
