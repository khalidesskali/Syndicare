from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    SyndicAdminViewSet,
    SubscriptionPlanAdminViewSet,
    SubscriptionAdminViewSet,
    PaymentAdminViewSet,
    CustomTokenObtainPairView,
    RegisterView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    verify_token,
    check_auth,
    admin_dashboard,
    syndic_dashboard,
    resident_dashboard,
    ImmeubleViewSet,
    AppartementViewSet,
    ResidentViewSet,
    ReclamationViewSet,
    ReunionViewSet,
    ChargeViewSet,
    ResidentPaymentViewSet,
    ResidentChargeViewSet
) 

router = DefaultRouter()
router.register(r'admin/syndics', SyndicAdminViewSet, basename='admin-syndic')
router.register(r'admin/subscription-plans', SubscriptionPlanAdminViewSet, basename='admin-subscription-plan')
router.register(r'admin/subscriptions', SubscriptionAdminViewSet, basename='admin-subscription')
router.register(r'admin/payments', PaymentAdminViewSet, basename='admin-payment')

# Syndic endpoints
router.register(r'syndic/buildings', ImmeubleViewSet, basename='syndic-building')
router.register(r'syndic/apartments', AppartementViewSet, basename='syndic-apartment')
router.register(r'syndic/residents', ResidentViewSet, basename='syndic-resident')
router.register(r'syndic/reclamations', ReclamationViewSet, basename='syndic-reclamation')
router.register(r'syndic/reunions', ReunionViewSet, basename='syndic-reunion')
router.register(r'syndic/charges', ChargeViewSet, basename='syndic-charge')

# Resident endpoints
router.register(r'resident/payments', ResidentPaymentViewSet, basename='resident-payment')
router.register(
    r'resident/charges',
    ResidentChargeViewSet,
    basename='resident-charge'
)


urlpatterns = [
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/check/', check_auth, name='check_auth'),
    path('auth/verify/', verify_token, name='verify_token'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Role-specific dashboards
    path('admin/dashboard/', admin_dashboard, name='admin_dashboard'),
    path('syndic/dashboard/', syndic_dashboard, name='syndic_dashboard'),
    path('resident/dashboard/', resident_dashboard, name='resident_dashboard'),

    path('', include(router.urls)),
]