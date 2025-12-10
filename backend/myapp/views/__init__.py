# Views package for myapp

from .authentication import (
    CustomTokenObtainPairView,
    RegisterView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    verify_token,
    check_auth
)

from .dashboard import (
    admin_dashboard,
    syndic_dashboard,
    resident_dashboard
)

from .syndic_admin import (
    SyndicAdminViewSet
)

from .subscription import (
    SubscriptionPlanAdminViewSet,
    SubscriptionAdminViewSet
)

from .payment import (
    PaymentAdminViewSet
)

__all__ = [
    # Authentication views
    'CustomTokenObtainPairView',
    'RegisterView',
    'LogoutView',
    'UserProfileView',
    'ChangePasswordView',
    'verify_token',
    'check_auth',
    
    # Dashboard views
    'admin_dashboard',
    'syndic_dashboard',
    'resident_dashboard',
    
    # Admin management views
    'SyndicAdminViewSet',
    
    # Subscription views
    'SubscriptionPlanAdminViewSet',
    'SubscriptionAdminViewSet',
    
    # Payment views
    'PaymentAdminViewSet',
]
