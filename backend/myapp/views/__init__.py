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

from .immeubles import (
    ImmeubleViewSet
)

from .apparetments import (
    AppartementViewSet
)

from .residents_management import (
    ResidentViewSet
)

from .reclamations import (
    ReclamationViewSet
)

from .reunions import (
    ReunionViewSet
)

from .charges import (
    ChargeViewSet
)

from .resident_payment import (
    ResidentPaymentViewSet
)

from .resident_charge import (
    ResidentChargeViewSet
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
    
    # Building management views
    'ImmeubleViewSet',
    'AppartementViewSet',
    'ResidentViewSet',
    'ChargeViewSet',
    'ResidentPaymentViewSet',
    'ResidentChargeViewSet',
]
