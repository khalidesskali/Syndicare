from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views.authentication import (
    CustomTokenObtainPairView, RegisterView, LogoutView, UserProfileView,
    ResidentProfileView, ChangePasswordView, verify_token, check_auth
)
from .views.dashboard import admin_dashboard, syndic_dashboard, resident_dashboard
from .views.notifications import NotificationViewSet
from .views.syndic_admin import SyndicAdminViewSet

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notification')
router.register('admin/syndics', SyndicAdminViewSet, basename='admin-syndic')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('resident/profile/', ResidentProfileView.as_view(), name='resident_profile_detail'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/confirm-email/', verify_token, name='confirm_email'),
    path('auth/verify/', verify_token, name='verify_token'),
    path('auth/check/', check_auth, name='check_auth'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dashboards
    path('admin/dashboard/', admin_dashboard, name='admin_dashboard'),
    path('syndic/dashboard/', syndic_dashboard, name='syndic_dashboard'),
    path('resident/dashboard/', resident_dashboard, name='resident_dashboard'),
    
    path('', include(router.urls)),
]
