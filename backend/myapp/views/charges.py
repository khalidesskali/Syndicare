from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from datetime import datetime
from django.utils import timezone

from ..models import Charge, Appartement, Immeuble, ResidentPayment
from ..serializers import ChargeSerializer
from ..permissions import IsSyndic


class ChargeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing charges by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ChargeSerializer
    
    def get_queryset(self):
        """Return only charges for apartments in syndic's buildings"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return Charge.objects.none()
            
        if not self.request.user or not self.request.user.is_authenticated:
            return Charge.objects.none()
        return Charge.objects.filter(
            appartement__immeuble__syndic=self.request.user
        ).select_related('appartement', 'appartement__immeuble').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        List all charges
        GET /api/syndic/charges/
        """
        queryset = self.get_queryset()
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by building
        building_id = request.query_params.get('building_id', None)
        if building_id:
            queryset = queryset.filter(appartement__immeuble_id=building_id)
        
        # Filter by apartment
        apartment_id = request.query_params.get('apartment_id', None)
        if apartment_id:
            queryset = queryset.filter(appartement_id=apartment_id)
        
        # Filter overdue
        overdue = request.query_params.get('overdue', None)
        if overdue and overdue.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(status='UNPAID', due_date__lt=today)
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        """
        Create a new charge
        POST /api/syndic/charges/
        Body: {
            "appartement": 1,
            "description": "Monthly charge - December 2024",
            "amount": 500.00,
            "due_date": "2024-12-31"
        }
        """
        # Verify apartment ownership
        apartment_id = request.data.get('appartement')
        if not self._verify_apartment_ownership(apartment_id):
            return Response({
                'success': False,
                'message': 'Invalid apartment ID or you do not manage this apartment'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            charge = serializer.save()
            return Response({
                'success': True,
                'message': 'Charge created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get charge details with payments
        GET /api/syndic/charges/{id}/
        """
        charge = self.get_object()
        serializer = self.get_serializer(charge)
        
        # Get payments for this charge
        payments = ResidentPayment.objects.filter(charge=charge).select_related('resident')
        payments_data = [{
            'id': p.id,
            'amount': float(p.amount),
            'payment_method': p.payment_method,
            'payment_date': p.payment_date.isoformat(),
            'reference': p.reference,
            'resident_email': p.resident.email
        } for p in payments]
        
        return Response({
            'success': True,
            'data': serializer.data,
            'payments': payments_data
        })
    
    def update(self, request, *args, **kwargs):
        """
        Update charge
        PUT /api/syndic/charges/{id}/
        """
        partial = kwargs.pop('partial', False)
        charge = self.get_object()
        serializer = self.get_serializer(charge, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Charge updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update charge
        PATCH /api/syndic/charges/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a charge
        DELETE /api/syndic/charges/{id}/
        """
        charge = self.get_object()
        
        # Check if charge has payments
        if charge.resident_payments.exists():
            return Response({
                'success': False,
                'message': 'Cannot delete charge with existing payments'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        charge.delete()
        
        return Response({
            'success': True,
            'message': 'Charge deleted successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """
        Mark charge as paid
        POST /api/syndic/charges/{id}/mark_paid/
        Body: {
            "paid_amount": 500.00,
            "paid_date": "2024-12-15"
        }
        """
        charge = self.get_object()
        paid_amount = request.data.get('paid_amount')
        paid_date_str = request.data.get('paid_date')
        
        if not paid_amount:
            return Response({
                'success': False,
                'message': 'Paid amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        charge.paid_amount = paid_amount
        charge.status = 'PAID' if float(paid_amount) >= float(charge.amount) else 'PARTIALLY_PAID'
        
        if paid_date_str:
            charge.paid_date = datetime.strptime(paid_date_str, '%Y-%m-%d').date()
        else:
            charge.paid_date = timezone.now().date()
        
        charge.save()
        
        return Response({
            'success': True,
            'message': 'Charge marked as paid',
            'data': self.get_serializer(charge).data
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create charges for multiple apartments
        POST /api/syndic/charges/bulk_create/
        Body: {
            "building_id": 1,
            "description": "Monthly charge - December 2024",
            "due_date": "2024-12-31"
        }
        """
        building_id = request.data.get('building_id')
        description = request.data.get('description')
        due_date_str = request.data.get('due_date')
        
        if not all([building_id, description, due_date_str]):
            return Response({
                'success': False,
                'message': 'Building ID, description, and due date are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify building ownership
        if not self._verify_building_ownership(building_id):
            return Response({
                'success': False,
                'message': 'Invalid building ID or you do not own this building'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            
            # Get all apartments in the building
            apartments = Appartement.objects.filter(immeuble_id=building_id)
            
            charges_created = 0
            for apartment in apartments:
                Charge.objects.create(
                    appartement=apartment,
                    description=description,
                    amount=apartment.monthly_charge,
                    due_date=due_date
                )
                charges_created += 1
            
            return Response({
                'success': True,
                'message': f'{charges_created} charges created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get charge statistics
        GET /api/syndic/charges/statistics/
        """
        queryset = self.get_queryset()
        today = timezone.now().date()
        
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        paid_amount = queryset.filter(status='PAID').aggregate(total=Sum('paid_amount'))['total'] or 0
        unpaid_amount = queryset.filter(status='UNPAID').aggregate(total=Sum('amount'))['total'] or 0
        overdue_amount = queryset.filter(status='UNPAID', due_date__lt=today).aggregate(total=Sum('amount'))['total'] or 0
        
        stats = {
            'total_charges': queryset.count(),
            'paid': queryset.filter(status='PAID').count(),
            'unpaid': queryset.filter(status='UNPAID').count(),
            'overdue': queryset.filter(status='UNPAID', due_date__lt=today).count(),
            'partially_paid': queryset.filter(status='PARTIALLY_PAID').count(),
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'unpaid_amount': float(unpaid_amount),
            'overdue_amount': float(overdue_amount),
            'collection_rate': round((paid_amount / total_amount * 100), 1) if total_amount > 0 else 0
        }
        
        return Response({
            'success': True,
            'data': stats
        })
    
    def _verify_apartment_ownership(self, apartment_id):
        """Verify that the apartment is in a building owned by the syndic"""
        if not apartment_id:
            return False
        return Appartement.objects.filter(
            id=apartment_id,
            immeuble__syndic=self.request.user
        ).exists()
    
    def _verify_building_ownership(self, building_id):
        """Verify that the building belongs to the syndic"""
        if not building_id:
            return False
        return Immeuble.objects.filter(id=building_id, syndic=self.request.user).exists()
