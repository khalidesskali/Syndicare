from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer, 
    RegisterSerializer,
    ChangePasswordSerializer,
    LogoutSerializer
)
from .permissions import IsAdmin, IsSyndic, IsResident
from .throttling import (
    LoginRateThrottle, 
    RegisterRateThrottle, 
    PasswordChangeRateThrottle
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Enhanced login view with rate limiting and account lockout
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            
            # Log successful login
            if response.status_code == 200:
                email = request.data.get('email')
                user = User.objects.get(email=email)
                # You can log this to a login history table
                
            return response
        except Exception as e:
            # Log failed login attempt
            return Response(
                {'detail': 'Invalid credentials or account inactive.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class RegisterView(generics.CreateAPIView):
    """
    Enhanced registration view with rate limiting
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    throttle_classes = [RegisterRateThrottle]
    
    def get_permissions(self):
        return [permissions.AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Generate tokens for new user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User created successfully.',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutView(APIView):
    """
    Logout view that blacklists the refresh token
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Get current user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    Enhanced password change with rate limiting
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [PasswordChangeRateThrottle]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Invalidate all existing tokens
            RefreshToken.for_user(user)
            
            return Response(
                {'message': 'Password updated successfully. Please login again.'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    """
    Admin dashboard endpoint
    """
    return Response({
        'message': 'Welcome to Admin Dashboard',
        'user': UserSerializer(request.user).data
    })


@api_view(['GET'])
@permission_classes([IsSyndic])
def syndic_dashboard(request):
    """
    Syndic dashboard with subscription check
    """
    return Response({
        'message': 'Welcome to Syndic Dashboard',
        'user': UserSerializer(request.user).data,
        'has_valid_subscription': request.user.has_valid_subscription
    })


@api_view(['GET'])
@permission_classes([IsResident])
def resident_dashboard(request):
    """
    Resident dashboard endpoint
    """
    return Response({
        'message': 'Welcome to Resident Dashboard',
        'user': UserSerializer(request.user).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_token(request):
    """
    Verify token validity and return token info
    """
    try:
        # Get the token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            # Try to decode the token to get its payload
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            
            return Response({
                'valid': True,
                'token_type': 'access',
                'exp': access_token['exp'],
                'user_id': access_token['user_id'],
                'user': UserSerializer(request.user).data
            })
        else:
            return Response(
                {'valid': False, 'error': 'No valid token provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Exception as e:
        return Response(
            {'valid': False, 'error': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth(request):
    """
    Check authentication status
    """
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data
    })

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.utils import timezone

from .models import (
    User, SyndicProfile, Subscription, SubscriptionPlan, 
    Payment, Immeuble, Appartement
)
from .serializers import UserSerializer
from .permissions import IsAdmin


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
                Q(last_name__icontains=search) |
                Q(syndic_profile__company_name__icontains=search)
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
            "password": "password123",
            "first_name": "Ahmed",
            "last_name": "Benani",
            "phone": "+212666123456",
            "company_name": "Syndic Al Wafa",
            "license_number": "LIC123456",
            "address": "123 Rue Mohammed V, Casablanca"
        }
        """
        # Extract profile data
        company_name = request.data.get('company_name')
        license_number = request.data.get('license_number', '')
        address = request.data.get('address', '')
        
        if not company_name:
            return Response({
                'success': False,
                'errors': {'company_name': ['Company name is required']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user_data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'phone': request.data.get('phone', ''),
            'role': 'SYNDIC'
        }
        
        serializer = self.get_serializer(data=user_data)
        if serializer.is_valid():
            user = serializer.save(created_by=request.user)
            
            # Create syndic profile
            SyndicProfile.objects.create(
                user=user,
                company_name=company_name,
                license_number=license_number,
                address=address
            )
            
            return Response({
                'success': True,
                'message': 'Syndic account created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
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
                if 'company_name' in request.data:
                    profile.company_name = request.data['company_name']
                if 'license_number' in request.data:
                    profile.license_number = request.data['license_number']
                if 'address' in request.data:
                    profile.address = request.data['address']
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
        
        # Update profile if data provided
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
        company_name = syndic.syndic_profile.company_name if hasattr(syndic, 'syndic_profile') else ''
        
        # Delete the syndic (this will cascade delete the profile)
        syndic.delete()
        
        return Response({
            'success': True,
            'message': f'Syndic account {email} ({company_name}) deleted successfully'
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
            'total_buildings': Immeuble.objects.count(),
            'total_apartments': Appartement.objects.count(),
            'active_subscriptions': Subscription.objects.filter(status='ACTIVE').count(),
            'recent_syndics': self.get_serializer(
                User.objects.filter(role='SYNDIC').order_by('-date_joined')[:5],
                many=True
            ).data
        }
        
        return Response({
            'success': True,
            'data': stats
        })

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.utils import timezone

from .models import (
    User, SyndicProfile, Subscription, SubscriptionPlan, 
    Payment, Immeuble, Appartement
)
from .serializers import (
    SubscriptionPlanSerializer, 
    SubscriptionSerializer, 
    PaymentSerializer,
    UserSerializer
)
from .permissions import IsAdmin


# ============================================
# SUBSCRIPTION PLANS MANAGEMENT
# ============================================

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
        Delete a subscription plan (soft delete by deactivating)
        DELETE /api/admin/subscription-plans/{id}/
        """
        plan = self.get_object()
        
        # Check if plan has active subscriptions
        if plan.subscriptions.filter(status='ACTIVE').exists():
            return Response({
                'success': False,
                'message': 'Cannot delete plan with active subscriptions'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Soft delete
        plan.is_active = False
        plan.save()
        
        return Response({
            'success': True,
            'message': 'Subscription plan deactivated successfully'
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
        payments = Payment.objects.filter(subscription=subscription)
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
            'total_revenue': Payment.objects.filter(
                status='COMPLETED'
            ).aggregate(total=Sum('amount'))['total'] or 0
        }
        
        return Response({
            'success': True,
            'data': stats
        })


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