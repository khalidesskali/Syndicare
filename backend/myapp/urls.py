from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from rest_framework.routers import DefaultRouter
from .views import (
    SyndicAdminViewSet,
    SubscriptionPlanAdminViewSet,
    SubscriptionAdminViewSet,
    PaymentAdminViewSet
)



router = DefaultRouter()
router.register(r'admin/syndics', views.SyndicAdminViewSet, basename='admin-syndic')
router.register(r'admin/subscription-plans', SubscriptionPlanAdminViewSet, basename='admin-subscription-plan')
router.register(r'admin/subscriptions', SubscriptionAdminViewSet, basename='admin-subscription')
router.register(r'admin/payments', PaymentAdminViewSet, basename='admin-payment')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('auth/check/', views.check_auth, name='check_auth'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user_profile'),
    
    # Role-specific dashboards
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('syndic/dashboard/', views.syndic_dashboard, name='syndic_dashboard'),
    path('resident/dashboard/', views.resident_dashboard, name='resident_dashboard'),

    path('', include(router.urls)),
]

