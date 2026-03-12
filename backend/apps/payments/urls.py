from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChargeViewSet, ResidentChargeViewSet, SyndicResidentPaymentViewSet, ResidentPaymentViewSet

syndic_router = DefaultRouter()
syndic_router.register('charges', ChargeViewSet, basename='syndic-charge')
syndic_router.register('resident-payments', SyndicResidentPaymentViewSet, basename='syndic-resident-payment')

resident_router = DefaultRouter()
resident_router.register('charges', ResidentChargeViewSet, basename='resident-charge')
resident_router.register('payments', ResidentPaymentViewSet, basename='resident-payment')

urlpatterns = [
    path('syndic/', include(syndic_router.urls)),
    path('resident/', include(resident_router.urls)),
]
