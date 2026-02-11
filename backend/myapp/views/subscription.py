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
    SubscriptionPayment, Immeuble, Appartement
)
from ..serializers import (
    SubscriptionPlanSerializer, 
    SubscriptionSerializer, 
    SubscriptionPaymentSerializer,
    UserSerializer
)
from ..permissions import IsAdmin


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
        Body: {
            "name": "Premium Plan",
            "description": "Best for medium-sized syndics",
            "price": 1000.00,
            "duration_days": 30,
            "max_buildings": 5,
            "max_apartments": 150
        }
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
                total=Sum('plan__price')
            )['total'] or 0
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'statistics': stats
        })

    def update(self, request, *args, **kwargs):
        """
        Update a subscription plan
        PUT /api/admin/subscription-plans/{id}/
        """
        partial = kwargs.pop('partial', False)
        plan = self.get_object()
        serializer = self.get_serializer(plan, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Subscription plan updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """
        Partially update a subscription plan
        PATCH /api/admin/subscription-plans/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a subscription plan
        DELETE /api/admin/subscription-plans/{id}/
        """
        plan = self.get_object()
        
        # Check if plan has active subscriptions
        if plan.subscriptions.filter(status='ACTIVE').exists():
            return Response({
                'success': False,
                'message': 'Cannot delete plan with active subscriptions'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Permanent deletion
        plan.delete()
        
        return Response({
            'success': True,
            'message': 'Subscription plan deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a subscription plan
        POST /api/admin/subscription-plans/{id}/activate/
        """
        plan = self.get_object()
        plan.is_active = True
        plan.save()
        
        return Response({
            'success': True,
            'message': 'Subscription plan activated successfully',
            'data': self.get_serializer(plan).data
        })

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a subscription plan
        POST /api/admin/subscription-plans/{id}/deactivate/
        """
        plan = self.get_object()
        plan.is_active = False
        plan.save()
        
        return Response({
            'success': True,
            'message': 'Subscription plan deactivated successfully',
            'data': self.get_serializer(plan).data
        })


# ============================================
# SYNDIC SUBSCRIPTION PLANS VIEW
# ============================================

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for syndics to view available subscription plans
    Only accessible by authenticated syndics
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.all()

    def get_queryset(self):
        """
        Only return active plans for syndics
        """
        return SubscriptionPlan.objects.filter(is_active=True).order_by('price')

    def list(self, request, *args, **kwargs):
        """
        List all active subscription plans for syndics
        GET /api/syndic/subscription-plans/
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'results': serializer.data,
            'count': queryset.count()
        })


# ============================================
# SUBSCRIPTIONS MANAGEMENT
# ============================================

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
        queryset = Subscription.objects.all().select_related(
            'syndic_profile__user', 'plan'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by syndic
        syndic_id = self.request.query_params.get('syndic_id', None)
        if syndic_id:
            queryset = queryset.filter(syndic_profile__user_id=syndic_id)
        
        # Filter expiring soon (within 7 days)
        expiring_soon = self.request.query_params.get('expiring_soon', None)
        if expiring_soon and expiring_soon.lower() == 'true':
            today = timezone.now().date()
            week_later = today + timedelta(days=7)
            queryset = queryset.filter(
                status='ACTIVE',
                end_date__gte=today,
                end_date__lte=week_later
            )
        
        # Filter expired
        expired = self.request.query_params.get('expired', None)
        if expired and expired.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(end_date__lt=today)
        
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        """
        List all subscriptions with filters
        GET /api/admin/subscriptions/
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
        Create a new subscription for a syndic
        POST /api/admin/subscriptions/
        Body: {
            "syndic_id": 5,
            "plan_id": 2,
            "start_date": "2024-12-01",
            "auto_renew": false
        }
        """
        syndic_id = request.data.get('syndic_id')
        plan_id = request.data.get('plan_id')
        start_date_str = request.data.get('start_date')
        auto_renew = request.data.get('auto_renew', False)
        
        if not syndic_id or not plan_id:
            return Response({
                'success': False,
                'message': 'Syndic ID and Plan ID are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get syndic user and profile
            syndic = User.objects.get(id=syndic_id, role='SYNDIC')
            syndic_profile = syndic.syndic_profile
            
            # Get plan
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            
            # Parse start date
            if start_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            else:
                start_date = timezone.now().date()
            
            # Calculate end date
            end_date = start_date + timedelta(days=plan.duration_days)
            
            # Check if syndic already has a subscription
            if hasattr(syndic_profile, 'subscription'):
                return Response({
                    'success': False,
                    'message': 'Syndic already has a subscription. Use update or renew instead.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create subscription
            subscription = Subscription.objects.create(
                syndic_profile=syndic_profile,
                plan=plan,
                start_date=start_date,
                end_date=end_date,
                status='ACTIVE',
                auto_renew=auto_renew
            )
            
            serializer = self.get_serializer(subscription)
            return Response({
                'success': True,
                'message': 'Subscription created successfully',
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
        except SyndicProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Syndic profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def retrieve(self, request, *args, **kwargs):
        """
        Get subscription details
        GET /api/admin/subscriptions/{id}/
        """
        subscription = self.get_object()
        serializer = self.get_serializer(subscription)
        
        # Get payment history
        payments = SubscriptionPayment.objects.filter(subscription=subscription)
        payment_stats = {
            'total_payments': payments.count(),
            'total_paid': payments.filter(status='COMPLETED').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'pending_payments': payments.filter(status='PENDING').count()
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'payment_stats': payment_stats
        })

    def update(self, request, *args, **kwargs):
        """
        Update subscription
        PUT /api/admin/subscriptions/{id}/
        """
        partial = kwargs.pop('partial', False)
        subscription = self.get_object()
        serializer = self.get_serializer(subscription, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Subscription updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """
        Partially update subscription
        PATCH /api/admin/subscriptions/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """
        Renew a subscription
        POST /api/admin/subscriptions/{id}/renew/
        Body: {
            "duration_days": 30  // Optional, uses plan default if not provided
        }
        """
        subscription = self.get_object()
        duration_days = request.data.get('duration_days', subscription.plan.duration_days)
        
        # Set new start and end dates
        subscription.start_date = timezone.now().date()
        subscription.end_date = subscription.start_date + timedelta(days=duration_days)
        subscription.status = 'ACTIVE'
        subscription.save()
        
        return Response({
            'success': True,
            'message': 'Subscription renewed successfully',
            'data': self.get_serializer(subscription).data
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
        
        return Response({
            'success': True,
            'message': 'Subscription suspended successfully',
            'data': self.get_serializer(subscription).data
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a subscription
        POST /api/admin/subscriptions/{id}/cancel/
        """
        subscription = self.get_object()
        subscription.status = 'CANCELLED'
        subscription.save()
        
        return Response({
            'success': True,
            'message': 'Subscription cancelled successfully',
            'data': self.get_serializer(subscription).data
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
        
        return Response({
            'success': True,
            'message': 'Subscription activated successfully',
            'data': self.get_serializer(subscription).data
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
            SubscriptionPayment.objects.create(
                subscription=subscription,
                amount=plan.price,
                payment_method='PAYPAL',  # Default method
                status='PENDING',
                notes=f'Initial subscription payment for {plan.name}',
                processed_by=request.user
            )
            
            serializer = self.get_serializer(subscription)
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

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get subscription statistics for dashboard
        GET /api/admin/subscriptions/dashboard_stats/
        """
        today = timezone.now().date()
        week_later = today + timedelta(days=7)
        
        stats = {
            'total_subscriptions': Subscription.objects.count(),
            'active_subscriptions': Subscription.objects.filter(status='ACTIVE').count(),
            'expired_subscriptions': Subscription.objects.filter(status='EXPIRED').count(),
            'suspended_subscriptions': Subscription.objects.filter(status='SUSPENDED').count(),
            'expiring_soon': Subscription.objects.filter(
                status='ACTIVE',
                end_date__gte=today,
                end_date__lte=week_later
            ).count(),
            'total_revenue': SubscriptionPayment.objects.filter(
                status='COMPLETED'
            ).aggregate(total=Sum('amount'))['total'] or 0
        }
        
        return Response({
            'success': True,
            'data': stats
        })
