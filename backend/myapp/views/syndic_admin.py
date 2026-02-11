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
from ..serializers import UserSerializer
from ..permissions import IsAdmin


class SyndicAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Syndic accounts by Admin
    Provides CRUD operations and additional management features
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """
        Get all users with SYNDIC role
        """
        queryset = User.objects.filter(role='SYNDIC').select_related('syndic_profile')
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Active filter
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-date_joined')

    def list(self, request, *args, **kwargs):
        """
        List all syndic accounts with pagination
        GET /api/admin/syndics/
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Pagination
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
        Create a new syndic account with profile
        POST /api/admin/syndics/
        Body: {
            "email": "syndic@example.com",
            "first_name": "Ahmed",
            "last_name": "Benani",
            "phone": "+212666123456",
        }
        """
        # Extract profile data
        password = request.data.get('password')
        
        if not password:
            return Response({
                'success': False,
                'errors': {'password': ['Password is required']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create user with hashed password
            user = User.objects.create_user(
                email=request.data.get('email'),
                password=password,  
                first_name=request.data.get('first_name', ''),
                last_name=request.data.get('last_name', ''),
                role='SYNDIC',
                is_active=True,
            )
            
            # Create syndic profile
            syndic_profile = SyndicProfile.objects.create(
                user=user,
            )
            
            # Get the serialized data
            serializer = self.get_serializer(user)
            
            return Response({
                'success': True,
                'message': 'Syndic account created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'error': [str(e)]}
            }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        """
        Get detailed information about a specific syndic
        GET /api/admin/syndics/{id}/
        """
        syndic = self.get_object()
        serializer = self.get_serializer(syndic)
        
        # Get additional statistics
        total_buildings = Immeuble.objects.filter(syndic=syndic).count()
        total_apartments = Appartement.objects.filter(immeuble__syndic=syndic).count()
        occupied_apartments = Appartement.objects.filter(
            immeuble__syndic=syndic,
            resident__isnull=False
        ).count()
        
        # Get subscription info
        subscription_info = None
        try:
            profile = syndic.syndic_profile
            if hasattr(profile, 'subscription'):
                sub = profile.subscription
                subscription_info = {
                    'plan': sub.plan.name,
                    'status': sub.status,
                    'start_date': sub.start_date,
                    'end_date': sub.end_date,
                    'days_remaining': sub.days_remaining,
                    'is_active': sub.is_active
                }
        except:
            pass
        
        return Response({
            'success': True,
            'data': serializer.data,
            'statistics': {
                'total_buildings': total_buildings,
                'total_apartments': total_apartments,
                'occupied_apartments': occupied_apartments,
                'vacant_apartments': total_apartments - occupied_apartments
            },
            'subscription': subscription_info
        })

    def update(self, request, *args, **kwargs):
        """
        Update syndic account information
        PUT /api/admin/syndics/{id}/
        """
        partial = kwargs.pop('partial', False)
        syndic = self.get_object()
        
        # Update user fields
        serializer = self.get_serializer(syndic, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            
            # Update profile if data provided
            try:
                profile = syndic.syndic_profile
                # No profile fields to update as they were removed
                profile.save()
            except SyndicProfile.DoesNotExist:
                pass
            
            return Response({
                'success': True,
                'message': 'Syndic account updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """
        Partially update syndic account
        PATCH /api/admin/syndics/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a syndic account
        POST /api/admin/syndics/{id}/activate/
        """
        syndic = self.get_object()
        syndic.is_active = True
        syndic.save()
        
        return Response({
            'success': True,
            'message': 'Syndic account activated successfully',
            'data': self.get_serializer(syndic).data
        })

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Delete a syndic account permanently
        POST /api/admin/syndics/{id}/deactivate/
        """
        syndic = self.get_object()
        
        # Check if syndic has active buildings
        if Immeuble.objects.filter(syndic=syndic).exists():
            return Response({
                'success': False,
                'message': 'Cannot delete syndic with existing buildings. Please remove all buildings first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if syndic has active subscription
        try:
            if hasattr(syndic, 'syndic_profile') and hasattr(syndic.syndic_profile, 'subscription'):
                subscription = syndic.syndic_profile.subscription
                if subscription.status == 'ACTIVE':
                    return Response({
                        'success': False,
                        'message': 'Cannot delete syndic with active subscription. Cancel subscription first.'
                    }, status=status.HTTP_400_BAD_REQUEST)
        except:
            pass
        
        # Store info before deletion
        email = syndic.email
        
        # Delete the syndic (this will cascade delete the profile)
        syndic.delete()
        
        return Response({
            'success': True,
            'message': f'Syndic account {email} deleted successfully'
        })
    
    @action(detail=True, methods=['post'])
    def assign_subscription(self, request, pk=None):
        """
        Assign or update subscription for a syndic
        POST /api/admin/syndics/{id}/assign_subscription/
        Body: {
            "plan_id": 1,
            "start_date": "2024-01-01",
            "duration_days": 30
        }
        """
        syndic = self.get_object()
        plan_id = request.data.get('plan_id')
        start_date = request.data.get('start_date')
        
        if not plan_id:
            return Response({
                'success': False,
                'message': 'Plan ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            profile = syndic.syndic_profile
            
            # Parse start date or use today
            if start_date:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
            else:
                start = timezone.now().date()
            
            # Calculate end date
            end = start + timedelta(days=plan.duration_days)
            
            # Create or update subscription
            subscription, created = Subscription.objects.update_or_create(
                syndic_profile=profile,
                defaults={
                    'plan': plan,
                    'start_date': start,
                    'end_date': end,
                    'status': 'ACTIVE'
                }
            )
            
            action_text = 'created' if created else 'updated'
            
            return Response({
                'success': True,
                'message': f'Subscription {action_text} successfully',
                'data': {
                    'plan': plan.name,
                    'start_date': start,
                    'end_date': end,
                    'status': subscription.status
                }
            })
            
        except SubscriptionPlan.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Subscription plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except SyndicProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Syndic profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get detailed statistics for a syndic
        GET /api/admin/syndics/{id}/statistics/
        """
        syndic = self.get_object()
        
        buildings = Immeuble.objects.filter(syndic=syndic)
        apartments = Appartement.objects.filter(immeuble__syndic=syndic)
        
        stats = {
            'overview': {
                'total_buildings': buildings.count(),
                'total_apartments': apartments.count(),
                'occupied_apartments': apartments.filter(resident__isnull=False).count(),
                'vacant_apartments': apartments.filter(resident__isnull=True).count(),
            },
            'financial': {
                'total_monthly_charges': apartments.aggregate(
                    total=Sum('monthly_charge')
                )['total'] or 0,
            },
            'account': {
                'created_at': syndic.created_at,
                'last_login': syndic.last_login,
                'is_active': syndic.is_active,
            }
        }
        
        return Response({
            'success': True,
            'data': stats
        })

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get overall statistics for all syndics
        GET /api/admin/syndics/dashboard_stats/
        """
        total_syndics = User.objects.filter(role='SYNDIC').count()
        active_syndics = User.objects.filter(role='SYNDIC', is_active=True).count()
        
        stats = {
            'total_syndics': total_syndics,
            'active_syndics': active_syndics,
            'inactive_syndics': total_syndics - active_syndics,
            'active_subscriptions': Subscription.objects.filter(status='ACTIVE').count(),
        }
        
        return Response({
            'success': True,
            'data': stats
        })
