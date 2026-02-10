from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import SubscriptionPlan, Subscription, Payment
from .serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer,
    SubscriptionDetailSerializer, PaymentSerializer, PaymentDetailSerializer
)
from myapp.permissions import IsAdmin


class SubscriptionPlanAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subscription plans
    Only accessible by Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.all()

    def get_queryset(self):
        """
        Filter plans based on query parameters
        """
        queryset = SubscriptionPlan.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        """
        List all subscription plans
        GET /api/admin/subscription-plans/
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })

    def create(self, request, *args, **kwargs):
        """
        Create a new subscription plan
        POST /api/admin/subscription-plans/
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.save()
            return Response({
                'success': True,
                'message': 'Subscription plan created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        """
        Get details of a specific plan
        GET /api/admin/subscription-plans/{id}/
        """
        plan = self.get_object()
        serializer = self.get_serializer(plan)
        
        # Get statistics about this plan
        stats = {
            'total_subscriptions': plan.subscriptions.count(),
            'active_subscriptions': plan.subscriptions.filter(status='ACTIVE').count(),
            'total_revenue': plan.subscriptions.aggregate(
                total=Sum('payments__amount', filter=Q(payments__status='COMPLETED'))
            )['total'] or 0
        }
        
        return Response({
            'success': True,
            'data': {
                **serializer.data,
                'stats': stats
            }
        })

    def update(self, request, *args, **kwargs):
        """
        Update a subscription plan
        PUT /api/admin/subscription-plans/{id}/
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            # Prevent changing plan details if there are active subscriptions
            if instance.subscriptions.filter(status='ACTIVE').exists():
                protected_fields = ['price', 'duration_days', 'max_buildings', 'max_apartments']
                for field in protected_fields:
                    if field in request.data and str(getattr(instance, field)) != str(request.data[field]):
                        return Response({
                            'success': False,
                            'error': f'Cannot update {field} for plans with active subscriptions'
                        }, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_update(serializer)
            return Response({
                'success': True,
                'message': 'Subscription plan updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a subscription plan
        DELETE /api/admin/subscription-plans/{id}/
        """
        plan = self.get_object()
        
        # Prevent deleting plans with active subscriptions
        if plan.subscriptions.exists():
            return Response({
                'success': False,
                'error': 'Cannot delete a plan with active subscriptions'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        plan.delete()
        return Response({
            'success': True,
            'message': 'Subscription plan deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for syndics to view available subscription plans
    Only accessible by authenticated syndics
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.all()

    def get_queryset(self):
        """Only return active plans for syndics"""
        return SubscriptionPlan.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        """
        List all active subscription plans for syndics
        GET /api/syndic/subscription-plans/
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })


class SubscriptionAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing syndic subscriptions
    Only accessible by Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = SubscriptionSerializer
    queryset = Subscription.objects.all()

    def get_queryset(self):
        """
        Filter subscriptions based on query parameters
        """
        queryset = Subscription.objects.select_related(
            'syndic_profile__user', 'plan'
        ).prefetch_related('payments')
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status.upper())
        
        # Filter by syndic email
        email = self.request.query_params.get('email', None)
        if email:
            queryset = queryset.filter(
                syndic_profile__user__email__icontains=email
            )
        
        # Filter by plan
        plan_id = self.request.query_params.get('plan_id', None)
        if plan_id:
            queryset = queryset.filter(plan_id=plan_id)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            today = timezone.now().date()
            if is_active.lower() == 'true':
                queryset = queryset.filter(
                    status='ACTIVE',
                    start_date__lte=today,
                    end_date__gte=today
                )
            else:
                queryset = queryset.exclude(
                    status='ACTIVE',
                    start_date__lte=today,
                    end_date__gte=today
                )
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'retrieve':
            return SubscriptionDetailSerializer
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        """
        List all subscriptions with filters
        GET /api/admin/subscriptions/
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })

    def create(self, request, *args, **kwargs):
        """
        Create a new subscription for a syndic
        POST /api/admin/subscriptions/
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set end_date if not provided
            data = serializer.validated_data
            if 'end_date' not in data and 'start_date' in data:
                data['end_date'] = data['start_date'] + timedelta(
                    days=data['plan'].duration_days
                )
            
            subscription = serializer.save()
            return Response({
                'success': True,
                'message': 'Subscription created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """
        Renew a subscription
        POST /api/admin/subscriptions/{id}/renew/
        """
        subscription = self.get_object()
        duration_days = request.data.get('duration_days', subscription.plan.duration_days)
        
        # Calculate new end date
        if subscription.end_date < timezone.now().date():
            new_start = timezone.now().date()
        else:
            new_start = subscription.end_date + timedelta(days=1)
        
        new_end = new_start + timedelta(days=duration_days)
        
        # Update subscription
        subscription.start_date = new_start
        subscription.end_date = new_end
        subscription.status = 'ACTIVE'
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response({
            'success': True,
            'message': 'Subscription renewed successfully',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """
        Suspend a subscription
        POST /api/admin/subscriptions/{id}/suspend/
        """
        subscription = self.get_object()
        subscription.status = 'SUSPENDED'
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response({
            'success': True,
            'message': 'Subscription suspended successfully',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a subscription
        POST /api/admin/subscriptions/{id}/cancel/
        """
        subscription = self.get_object()
        subscription.status = 'CANCELLED'
        subscription.auto_renew = False
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response({
            'success': True,
            'message': 'Subscription cancelled successfully',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a suspended subscription
        POST /api/admin/subscriptions/{id}/activate/
        """
        subscription = self.get_object()
        subscription.status = 'ACTIVE'
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response({
            'success': True,
            'message': 'Subscription activated successfully',
            'data': serializer.data
        })

    @action(detail=False, methods=['post'])
    def assign_subscription(self, request):
        """
        Assign subscription plan to syndic
        POST /api/admin/subscription-assignment/assign_subscription/
        """
        from myapp.models import SyndicProfile
        
        syndic_id = request.data.get('syndic_id')
        plan_id = request.data.get('plan_id')
        start_date = request.data.get('start_date')
        
        try:
            syndic_profile = SyndicProfile.objects.get(id=syndic_id)
            plan = SubscriptionPlan.objects.get(id=plan_id)
            
            # End any existing active subscription
            Subscription.objects.filter(
                syndic_profile=syndic_profile,
                status='ACTIVE'
            ).update(status='EXPIRED')
            
            # Create new subscription
            end_date = start_date + timedelta(days=plan.duration_days)
            
            subscription = Subscription.objects.create(
                syndic_profile=syndic_profile,
                plan=plan,
                start_date=start_date,
                end_date=end_date,
                status='ACTIVE'
            )
            
            serializer = self.get_serializer(subscription)
            return Response({
                'success': True,
                'message': 'Subscription assigned successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except (SyndicProfile.DoesNotExist, SubscriptionPlan.DoesNotExist) as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def syndics_with_subscriptions(self, request):
        """
        Get all syndics with their subscription status
        GET /api/admin/subscription-assignment/syndics_with_subscriptions/
        """
        from myapp.models import SyndicProfile
        from django.db.models import F, Case, When, Value, CharField
        
        syndics = SyndicProfile.objects.select_related(
            'user', 'subscription', 'subscription__plan'
        ).annotate(
            subscription_status=Case(
                When(subscription__isnull=True, then=Value('NO_SUBSCRIPTION')),
                default=F('subscription__status'),
                output_field=CharField()
            ),
            plan_name=F('subscription__plan__name'),
            end_date=F('subscription__end_date')
        ).values(
            'id', 'user__email', 'user__first_name', 'user__last_name',
            'subscription_status', 'plan_name', 'end_date'
        )
        
        return Response({
            'success': True,
            'data': list(syndics)
        })

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get subscription statistics for dashboard
        GET /api/admin/subscriptions/dashboard_stats/
        """
        from django.db.models import Count, Q
        from datetime import date, timedelta
        
        today = date.today()
        thirty_days_ago = today - timedelta(days=30)
        
        # Total active subscriptions
        active_subscriptions = Subscription.objects.filter(
            status='ACTIVE',
            start_date__lte=today,
            end_date__gte=today
        ).count()
        
        # Expiring soon (within 30 days)
        expiring_soon = Subscription.objects.filter(
            status='ACTIVE',
            end_date__range=(today, today + timedelta(days=30))
        ).count()
        
        # Recently expired (last 30 days)
        recently_expired = Subscription.objects.filter(
            status='EXPIRED',
            end_date__range=(thirty_days_ago, today)
        ).count()
        
        # Revenue stats
        revenue_stats = {
            'total': Payment.objects.filter(
                status='COMPLETED'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'this_month': Payment.objects.filter(
                status='COMPLETED',
                payment_date__year=today.year,
                payment_date__month=today.month
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'last_month': Payment.objects.filter(
                status='COMPLETED',
                payment_date__year=(today.replace(day=1) - timedelta(days=1)).year,
                payment_date__month=(today.replace(day=1) - timedelta(days=1)).month
            ).aggregate(total=Sum('amount'))['total'] or 0
        }
        
        # Subscription growth (last 6 months)
        six_months_ago = today - timedelta(days=180)
        subscription_growth = []
        
        for i in range(6):
            month = today.replace(day=1) - timedelta(days=30*i)
            start_date = month.replace(day=1)
            if i == 0:
                end_date = today
            else:
                end_date = (month.replace(day=1, month=month.month+1) - timedelta(days=1))
            
            count = Subscription.objects.filter(
                created_at__date__range=(start_date, end_date)
            ).count()
            
            subscription_growth.append({
                'month': start_date.strftime('%Y-%m'),
                'count': count
            })
        
        return Response({
            'success': True,
            'data': {
                'active_subscriptions': active_subscriptions,
                'expiring_soon': expiring_soon,
                'recently_expired': recently_expired,
                'revenue': revenue_stats,
                'subscription_growth': sorted(
                    subscription_growth,
                    key=lambda x: x['month']
                )
            }
        })


class PaymentAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subscription payments
    Only accessible by Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()

    def get_queryset(self):
        """
        Filter payments based on query parameters
        """
        queryset = Payment.objects.select_related(
            'subscription', 'subscription__syndic_profile__user', 'processed_by'
        )
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status.upper())
        
        # Filter by syndic email
        email = self.request.query_params.get('email', None)
        if email:
            queryset = queryset.filter(
                subscription__syndic_profile__user__email__icontains=email
            )
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(payment_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__date__lte=end_date)
        
        return queryset.order_by('-payment_date')

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'retrieve':
            return PaymentDetailSerializer
        return super().get_serializer_class()

    def create(self, request, *args, **kwargs):
        """
        Create a new payment record
        POST /api/admin/payments/
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set processed_by to current user
            payment = serializer.save(processed_by=request.user)
            
            # Update subscription status if payment is completed
            if payment.status == 'COMPLETED':
                subscription = payment.subscription
                if subscription.status != 'ACTIVE':
                    subscription.status = 'ACTIVE'
                    subscription.save()
            
            return Response({
                'success': True,
                'message': 'Payment recorded successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark payment as completed
        POST /api/admin/payments/{id}/mark_completed/
        """
        payment = self.get_object()
        
        if payment.status != 'COMPLETED':
            payment.status = 'COMPLETED'
            payment.processed_by = request.user
            payment.save()
            
            # Update subscription status
            subscription = payment.subscription
            if subscription.status != 'ACTIVE':
                subscription.status = 'ACTIVE'
                subscription.save()
        
        serializer = self.get_serializer(payment)
        return Response({
            'success': True,
            'message': 'Payment marked as completed',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def mark_failed(self, request, pk=None):
        """
        Mark payment as failed
        POST /api/admin/payments/{id}/mark_failed/
        """
        payment = self.get_object()
        
        if payment.status != 'FAILED':
            payment.status = 'FAILED'
            payment.processed_by = request.user
            payment.save()
        
        serializer = self.get_serializer(payment)
        return Response({
            'success': True,
            'message': 'Payment marked as failed',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def issue_refund(self, request, pk=None):
        """
        Issue a refund for a payment
        POST /api/admin/payments/{id}/issue_refund/
        """
        payment = self.get_object()
        
        if payment.status != 'REFUNDED':
            # Create a refund record (simplified)
            refund_amount = request.data.get('amount', payment.amount)
            payment.status = 'REFUNDED'
            payment.save()
            
            # Here you would typically integrate with a payment processor's refund API
            # For now, we'll just log the refund
            print(f"Issued refund of {refund_amount} for payment {payment.id}")
        
        serializer = self.get_serializer(payment)
        return Response({
            'success': True,
            'message': 'Refund processed successfully',
            'data': serializer.data
        })