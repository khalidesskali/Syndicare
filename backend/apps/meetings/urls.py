from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReunionViewSet, ResidentReunionViewSet

syndic_router = DefaultRouter()
syndic_router.register('reunions', ReunionViewSet, basename='syndic-reunion')

resident_router = DefaultRouter()
resident_router.register('reunions', ResidentReunionViewSet, basename='resident-reunion')

urlpatterns = [
    path('syndic/', include(syndic_router.urls)),
    path('resident/', include(resident_router.urls)),
]
