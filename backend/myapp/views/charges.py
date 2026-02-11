from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from django.db import transaction
from django.utils import timezone
from datetime import datetime

from ..models import Charge, Appartement, Immeuble, ChargePayment
from ..serializers import ChargeSerializer
from ..permissions import IsSyndic


class ChargeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing charges with semi-digital payment workflow
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ChargeSerializer

    # ------------------------------------------------------------------
    # QUERYSET
    # ------------------------------------------------------------------
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Charge.objects.none()

        return Charge.objects.filter(
            appartement__immeuble__syndic=self.request.user
        ).select_related(
            'appartement', 'appartement__immeuble'
        ).order_by('-created_at')

    # ------------------------------------------------------------------
    # LIST
    # ------------------------------------------------------------------
    def list(self, request):
        queryset = self.get_queryset()

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        building_id = request.query_params.get('building_id')
        if building_id:
            queryset = queryset.filter(appartement__immeuble_id=building_id)

        apartment_id = request.query_params.get('apartment_id')
        if apartment_id:
            queryset = queryset.filter(appartement_id=apartment_id)

        overdue = request.query_params.get('overdue')
        if overdue == 'true':
            queryset = queryset.filter(
                status__in=['UNPAID', 'PARTIALLY_PAID'],
                due_date__lt=timezone.now().date()
            )

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(appartement__number__icontains=search) |
                Q(appartement__immeuble__name__icontains=search)
            )

        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })

    # ------------------------------------------------------------------
    # CREATE CHARGE
    # ------------------------------------------------------------------
    def create(self, request):
        apartment_id = request.data.get('appartement')

        if not self._verify_apartment_ownership(apartment_id):
            return Response({
                'success': False,
                'message': 'You do not manage this apartment'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status='UNPAID')

        return Response({
            'success': True,
            'message': 'Charge created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------
    # RETRIEVE (WITH PAYMENTS)
    # ------------------------------------------------------------------
    def retrieve(self, request, pk=None):
        charge = self.get_object()
        serializer = self.get_serializer(charge)

        payments = ResidentPayment.objects.filter(
            charge=charge
        ).select_related('resident')

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

    # ------------------------------------------------------------------
    # UPDATE CHARGE
    # ------------------------------------------------------------------
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
        """Handle PATCH requests for partial updates"""
        return self.update(request, pk)

    # ------------------------------------------------------------------
    # DELETE CHARGE
    # ------------------------------------------------------------------
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

    # ------------------------------------------------------------------
    # BULK CREATE
    # ------------------------------------------------------------------
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        building_id = request.data.get('building_id')
        description = request.data.get('description')
        due_date = request.data.get('due_date')

        if not all([building_id, description, due_date]):
            return Response({
                'success': False,
                'message': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not self._verify_building_ownership(building_id):
            return Response({
                'success': False,
                'message': 'You do not manage this building'
            }, status=status.HTTP_403_FORBIDDEN)

        due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        apartments = Appartement.objects.filter(immeuble_id=building_id)

        with transaction.atomic():
            for apartment in apartments:
                Charge.objects.create(
                    appartement=apartment,
                    description=description,
                    amount=apartment.monthly_charge,
                    due_date=due_date,
                    status='UNPAID'
                )

        return Response({
            'success': True,
            'message': f'{apartments.count()} charges created successfully'
        }, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------
    # RECALCULATE STATUS (INTERNAL)
    # ------------------------------------------------------------------
    def _recalculate_charge_status(self, charge):
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

    # ------------------------------------------------------------------
    # STATISTICS
    # ------------------------------------------------------------------
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        queryset = self.get_queryset()
        today = timezone.now().date()

        total_amount = queryset.aggregate(
            total=Sum('amount')
        )['total'] or 0

        confirmed_payments = ResidentPayment.objects.filter(
            charge__in=queryset,
            status='CONFIRMED'
        ).aggregate(total=Sum('amount'))['total'] or 0

        unpaid_amount = 0
        for charge in queryset.exclude(status='PAID'):
            paid = charge.payments.filter(
                status='CONFIRMED'
            ).aggregate(total=Sum('amount'))['total'] or 0
            unpaid_amount += max(charge.amount - paid, 0)

        stats = {
            'total_charges': queryset.count(),
            'paid': queryset.filter(status='PAID').count(),
            'partially_paid': queryset.filter(status='PARTIALLY_PAID').count(),
            'unpaid': queryset.filter(status='UNPAID').count(),
            'overdue': queryset.filter(
                status__in=['UNPAID', 'PARTIALLY_PAID'],
                due_date__lt=today
            ).count(),
            'total_amount': float(total_amount),
            'paid_amount': float(confirmed_payments),
            'unpaid_amount': float(unpaid_amount),
            'collection_rate': round(
                (confirmed_payments / total_amount * 100), 1
            ) if total_amount else 0
        }

        return Response({
            'success': True,
            'data': stats
        })

    # ------------------------------------------------------------------
    # OWNERSHIP HELPERS
    # ------------------------------------------------------------------
    def _verify_apartment_ownership(self, apartment_id):
        return Appartement.objects.filter(
            id=apartment_id,
            immeuble__syndic=self.request.user
        ).exists()

    def _verify_building_ownership(self, building_id):
        return Immeuble.objects.filter(
            id=building_id,
            syndic=self.request.user
        ).exists()
