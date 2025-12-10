from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.utils import timezone

from ..models import (
    User, SyndicProfile, Subscription, SubscriptionPlan, 
    Payment, Immeuble, Appartement
)
from ..serializers import (
    SubscriptionPlanSerializer, 
    SubscriptionSerializer, 
    PaymentSerializer,
    UserSerializer
)
from ..permissions import IsAdmin


# ============================================
# PAYMENTS MANAGEMENT
# ============================================

class PaymentAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payments
    Only accessible by Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()

    def get_queryset(self):
        """
        Filter payments based on query parameters
        """
        queryset = Payment.objects.all().select_related(
            'subscription__syndic_profile__user', 'processed_by'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by syndic
        syndic_id = self.request.query_params.get('syndic_id', None)
        if syndic_id:
            queryset = queryset.filter(subscription__syndic_profile__user_id=syndic_id)
        
        # Filter by payment method
        payment_method = self.request.query_params.get('payment_method', None)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        return queryset.order_by('-payment_date')

    def list(self, request, *args, **kwargs):
        """
        List all payments with filters
        GET /api/admin/payments/
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })

    def create(self, request, *args, **kwargs):
        """
        Record a new payment
        POST /api/admin/payments/
        Body: {
            "subscription_id": 5,
            "amount": 1000.00,
            "payment_method": "BANK_TRANSFER",
            "reference": "TRX123456",
            "notes": "Payment for December 2024"
        }
        """
        subscription_id = request.data.get('subscription_id')
        
        if not subscription_id:
            return Response({
                'success': False,
                'message': 'Subscription ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = Subscription.objects.get(id=subscription_id)
            
            payment_data = {
                'subscription': subscription.id,
                'amount': request.data.get('amount'),
                'payment_method': request.data.get('payment_method'),
                'reference': request.data.get('reference', ''),
                'notes': request.data.get('notes', ''),
                'status': request.data.get('status', 'PENDING')
            }
            
            serializer = self.get_serializer(data=payment_data)
            if serializer.is_valid():
                payment = serializer.save(processed_by=request.user)
                
                return Response({
                    'success': True,
                    'message': 'Payment recorded successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Subscription not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def retrieve(self, request, *args, **kwargs):
        """
        Get payment details
        GET /api/admin/payments/{id}/
        """
        payment = self.get_object()
        serializer = self.get_serializer(payment)
        
        return Response({
            'success': True,
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        """
        Update payment information
        PUT /api/admin/payments/{id}/
        """
        partial = kwargs.pop('partial', False)
        payment = self.get_object()
        serializer = self.get_serializer(payment, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Payment updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """
        Partially update payment
        PATCH /api/admin/payments/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark payment as completed
        POST /api/admin/payments/{id}/mark_completed/
        """
        payment = self.get_object()
        payment.status = 'COMPLETED'
        payment.save()
        
        return Response({
            'success': True,
            'message': 'Payment marked as completed',
            'data': self.get_serializer(payment).data
        })

    @action(detail=True, methods=['post'])
    def mark_failed(self, request, pk=None):
        """
        Mark payment as failed
        POST /api/admin/payments/{id}/mark_failed/
        """
        payment = self.get_object()
        payment.status = 'FAILED'
        payment.save()
        
        return Response({
            'success': True,
            'message': 'Payment marked as failed',
            'data': self.get_serializer(payment).data
        })

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """
        Refund a payment
        POST /api/admin/payments/{id}/refund/
        """
        payment = self.get_object()
        
        if payment.status != 'COMPLETED':
            return Response({
                'success': False,
                'message': 'Only completed payments can be refunded'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'REFUNDED'
        payment.notes += f"\nRefunded on {timezone.now().date()}"
        payment.save()
        
        return Response({
            'success': True,
            'message': 'Payment refunded successfully',
            'data': self.get_serializer(payment).data
        })

    @action(detail=False, methods=['get'])
    def revenue_stats(self, request):
        """
        Get revenue statistics
        GET /api/admin/payments/revenue_stats/
        """
        # Get date range from query params
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        payments = Payment.objects.filter(status='COMPLETED')
        
        if start_date:
            payments = payments.filter(payment_date__gte=start_date)
        if end_date:
            payments = payments.filter(payment_date__lte=end_date)
        
        stats = {
            'total_revenue': payments.aggregate(total=Sum('amount'))['total'] or 0,
            'total_payments': payments.count(),
            'by_method': {},
            'pending_amount': Payment.objects.filter(
                status='PENDING'
            ).aggregate(total=Sum('amount'))['total'] or 0
        }
        
        # Revenue by payment method
        for method in ['CASH', 'BANK_TRANSFER', 'CHECK', 'CARD']:
            amount = payments.filter(payment_method=method).aggregate(
                total=Sum('amount')
            )['total'] or 0
            stats['by_method'][method] = amount
        
        return Response({
            'success': True,
            'data': stats
        })
