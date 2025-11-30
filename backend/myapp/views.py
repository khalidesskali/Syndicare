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
        serializer = LogoutSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        PATCH /api/admin/syndics/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Deactivate a syndic account (soft delete)
        DELETE /api/admin/syndics/{id}/
        """
        syndic = self.get_object()
        
        # Check if syndic has active buildings
        if Immeuble.objects.filter(syndic=syndic).exists():
            return Response({
                'success': False,
                'message': 'Cannot delete syndic with existing buildings. Please remove all buildings first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Soft delete
        syndic.is_active = False
        syndic.save()
        
        return Response({
            'success': True,
            'message': 'Syndic account deactivated successfully'
        }, status=status.HTTP_200_OK)

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
        Deactivate a syndic account
        POST /api/admin/syndics/{id}/deactivate/
        """
        syndic = self.get_object()
        syndic.is_active = False
        syndic.save()
        
        return Response({
            'success': True,
            'message': 'Syndic account deactivated successfully',
            'data': self.get_serializer(syndic).data
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
