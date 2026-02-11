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
    SubscriptionPlanViewSet,
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

from .resident_reclamations import (
    ResidentReclamationViewSet
)

from .reunions import (
    ReunionViewSet
)

from .resident_reunions import (
    ResidentReunionViewSet
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
    'SubscriptionPlanViewSet',
    'SubscriptionPlanAdminViewSet',
    'SubscriptionAdminViewSet',
    
    # Payment views
    'PaymentAdminViewSet',
    
    # Building management views
    'ImmeubleViewSet',
    'AppartementViewSet',
    'ResidentViewSet',
    'ReclamationViewSet',
    'ResidentReclamationViewSet',
    'ReunionViewSet',
    'ResidentReunionViewSet',
    'ChargeViewSet',
    'ResidentPaymentViewSet',
    'ResidentChargeViewSet',
    
    # Chatbot views
    'chatbot_message',
]
