from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReclamationViewSet, ResidentReclamationViewSet

syndic_router = DefaultRouter()
syndic_router.register('reclamations', ReclamationViewSet, basename='syndic-reclamation')

resident_router = DefaultRouter()
resident_router.register('reclamations', ResidentReclamationViewSet, basename='resident-reclamation')

urlpatterns = [
    path('syndic/', include(syndic_router.urls)),
    path('resident/', include(resident_router.urls)),
]
