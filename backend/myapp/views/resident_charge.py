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
            "payment_method": "BANK_TRANSFER",
            "reference": "BMCE-2394023"
        }
        """
    
        charge = self.get_object()
        user = request.user
    
        # Ownership check
        if charge.appartement.resident != user:
            return Response(
                {"success": False, "message": "You do not have permission to pay this charge"},
                status=status.HTTP_403_FORBIDDEN
            )
    
        if charge.status == "PAID":
            return Response(
                {"success": False, "message": "This charge is already paid"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        payment_method = request.data.get("payment_method")
        reference = request.data.get("reference")
    
        if not payment_method:
            return Response(
                {"success": False, "message": "payment_method is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        # Full remaining amount is paid (resident does not choose)
        amount = charge.amount - charge.paid_amount
    
        if amount <= 0:
            return Response(
                {"success": False, "message": "No remaining amount to pay"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        payment = ResidentPayment.objects.create(
            resident=user,
            syndic=charge.appartement.immeuble.syndic,
            appartement=charge.appartement,
            charge=charge,
            amount=amount,
            payment_method=payment_method,
            reference=reference,
            paid_at=timezone.now(),
            status="PENDING",
            notes=""
        )
    
        # Update charge amounts (business consistency)
        charge.paid_amount += amount
        charge.save(update_fields="paid_amount")
    
        return Response(
            {
                "success": True,
                "message": "Payment submitted and awaiting syndic confirmation",
                "data": {
                    "payment_id": payment.id,
                    "charge_id": charge.id,
                    "amount": float(payment.amount),
                    "payment_status": payment.status
                }
            },
            status=status.HTTP_201_CREATED
        )