from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppartementViewSet, ResidentViewSet

router = DefaultRouter()
router.register('apartments', AppartementViewSet, basename='apartment')
router.register('residents', ResidentViewSet, basename='resident-management')

urlpatterns = [
    path('syndic/', include(router.urls)),
]
