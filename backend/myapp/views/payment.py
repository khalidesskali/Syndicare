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

    @action(detail=True, methods=['post'])
    def syndic_make_payment(self, request):
        """
        Create a new payment from syndic
        POST /api/syndic/payments/
        """
        syndic_id = request.data.get('syndic_id')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        reference = request.data.get('reference')
        notes = request.data.get('notes')
        subscription_id = request.data.get('subscription_id')
        
        if not syndic_id or not amount or not payment_method:
            return Response({
                'success': False,
                'message': 'Syndic ID, amount, and payment method are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get syndic user and profile
            syndic = User.objects.get(id=syndic_id, role='SYNDIC')
            syndic_profile = syndic.syndic_profile
            
            # Get subscription if provided
            subscription = None
            if subscription_id:
                subscription = Subscription.objects.get(id=subscription_id)
            
            # Create payment
            payment = Payment.objects.create(
                subscription=subscription,
                amount=amount,
                payment_method=payment_method,
                reference=reference,
                notes=notes,
                status='PENDING',
                processed_by=request.user
            )
            
            serializer = self.get_serializer(payment)
            return Response({
                'success': True,
                'message': 'Payment submitted successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Syndic not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Subscription not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve_syndic_payment(self, request, pk=None):
        """
        Approve a pending payment from syndic
        POST /api/syndic/payments/{id}/approve/
        """
        payment = self.get_object()
        
        if payment.status != 'PENDING':
            return Response({
                'success': False,
                'message': 'Only pending payments can be approved'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'COMPLETED'
        payment.save()
        
        return Response({
            'success': True,
            'message': 'Payment approved successfully',
            'data': self.get_serializer(payment).data
        })

    @action(detail=True, methods=['post'])
    def reject_syndic_payment(self, request, pk=None):
        """
        Reject a pending payment from syndic
        POST /api/syndic/payments/{id}/reject/
        """
        payment = self.get_object()
        reason = request.data.get('reason')
        
        if payment.status != 'PENDING':
            return Response({
                'success': False,
                'message': 'Only pending payments can be rejected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not reason:
            return Response({
                'success': False,
                'message': 'Rejection reason is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'FAILED'
        payment.notes += f"\nRejected on {timezone.now().date()}: {reason}"
        payment.save()
        
        return Response({
            'success': True,
            'message': 'Payment rejected successfully',
            'data': self.get_serializer(payment).data
        })

    @action(detail=False, methods=['post'])
    def assign_subscription(self, request):
        """
        Assign subscription plan to syndic
        POST /api/admin/subscription-assignment/assign_subscription/
        """
        syndic_id = request.data.get('syndic_id')
        plan_id = request.data.get('plan_id')
        start_date = request.data.get('start_date')
        
        if not syndic_id or not plan_id:
            return Response({
                'success': False,
                'message': 'Syndic ID and plan ID are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get syndic and plan
            syndic = User.objects.get(id=syndic_id, role='SYNDIC')
            syndic_profile = syndic.syndic_profile
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            
            # Calculate end date
            if not start_date:
                start_date = timezone.now().date()
            else:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
            end_date = start_date + timedelta(days=plan.duration_days)
            
            # Create or update subscription
            subscription, created = Subscription.objects.update_or_create(
                syndic_profile=syndic_profile,
                defaults={
                    'plan': plan,
                    'start_date': start_date,
                    'end_date': end_date,
                    'status': 'ACTIVE'
                }
            )
            
            # Create initial payment record
            Payment.objects.create(
                subscription=subscription,
                amount=plan.price,
                payment_method='BANK_TRANSFER',  # Default method
                status='PENDING',
                notes=f'Initial subscription payment for {plan.name}',
                processed_by=request.user
            )
            
            serializer = SubscriptionSerializer(subscription)
            return Response({
                'success': True,
                'message': 'Subscription assigned successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Syndic not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except SubscriptionPlan.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Subscription plan not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def syndics_with_subscriptions(self, request):
        """
        Get all syndics with their subscription status
        GET /api/admin/subscription-assignment/syndics_with_subscriptions/
        """
        syndics = User.objects.filter(role='SYNDIC').select_related('syndic_profile').prefetch_related(
            'syndic_profile__subscription__plan'
        )
        
        data = []
        for syndic in syndics:
            try:
                subscription = syndic.syndic_profile.subscription
                sub_data = None
                if subscription:
                    sub_data = {
                        'id': subscription.id,
                        'plan': {
                            'id': subscription.plan.id,
                            'name': subscription.plan.name,
                            'price': str(subscription.plan.price),
                            'duration_days': subscription.plan.duration_days
                        },
                        'start_date': subscription.start_date,
                        'end_date': subscription.end_date,
                        'status': subscription.status,
                        'days_remaining': subscription.days_remaining,
                        'is_active': subscription.is_active
                    }
                
                data.append({
                    'id': syndic.id,
                    'email': syndic.email,
                    'first_name': syndic.first_name,
                    'last_name': syndic.last_name,
                    'syndic_profile': {
                        'subscription': sub_data
                    }
                })
            except:
                data.append({
                    'id': syndic.id,
                    'email': syndic.email,
                    'first_name': syndic.first_name,
                    'last_name': syndic.last_name,
                    'syndic_profile': {
                        'subscription': None
                    }
                })
        
        return Response({
            'success': True,
            'data': data
        })

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """
        Process payment for subscription
        POST /api/admin/payments/{id}/process_payment/
        """
        payment = self.get_object()
        action_type = request.data.get('action')  # 'approve' or 'reject'
        notes = request.data.get('notes', '')
        
        if action_type not in ['approve', 'reject']:
            return Response({
                'success': False,
                'message': 'Action must be either approve or reject'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if payment.status != 'PENDING':
            return Response({
                'success': False,
                'message': 'Only pending payments can be processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if action_type == 'approve':
            payment.status = 'COMPLETED'
            payment.notes += f"\nApproved on {timezone.now().date()} by {request.user.email}"
            if notes:
                payment.notes += f"\nNotes: {notes}"
            message = 'Payment approved successfully'
        elif action_type == 'reject':
            payment.status = 'REJECTED'
            if not notes:
                return Response({
                    'success': False,
                    'message': 'Rejection reason is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            payment.notes += f"\nRejected on {timezone.now().date()} by {request.user.email}: {notes}"
            message = 'Payment rejected successfully'
        
        payment.save()
        
        return Response({
            'success': True,
            'message': message,
            'data': self.get_serializer(payment).data
        })

    @action(detail=False, methods=['post'])
    def create_payment(self, request):
        """
        Create new payment for subscription
        POST /api/admin/payments/create_payment/
        """
        subscription_id = request.data.get('subscription_id')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        reference = request.data.get('reference', '')
        notes = request.data.get('notes', '')
        
        if not subscription_id or not amount or not payment_method:
            return Response({
                'success': False,
                'message': 'Subscription ID, amount, and payment method are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = Subscription.objects.get(id=subscription_id)
            
            payment = Payment.objects.create(
                subscription=subscription,
                amount=amount,
                payment_method=payment_method,
                reference=reference,
                notes=notes,
                status='PENDING',
                processed_by=request.user
            )
            
            serializer = self.get_serializer(payment)
            return Response({
                'success': True,
                'message': 'Payment created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Subscription not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def syndic_payments(self, request):
        """
        Get payments for a specific syndic
        GET /api/admin/payments/syndic_payments/?syndic_id={id}
        """
        syndic_id = request.query_params.get('syndic_id')
        
        if not syndic_id:
            return Response({
                'success': False,
                'message': 'Syndic ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            syndic = User.objects.get(id=syndic_id, role='SYNDIC')
            payments = Payment.objects.filter(
                subscription__syndic_profile__user=syndic
            ).select_related('subscription__plan', 'processed_by')
            
            serializer = self.get_serializer(payments, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Syndic not found'
            }, status=status.HTTP_404_NOT_FOUND)

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
        for method in ['CASH', 'BANK_TRANSFER']:
            amount = payments.filter(payment_method=method).aggregate(
                total=Sum('amount')
            )['total'] or 0
            stats['by_method'][method] = amount
        
        return Response({
            'success': True,
            'data': stats
        })
