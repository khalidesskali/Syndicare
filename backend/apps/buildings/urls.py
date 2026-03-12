from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImmeubleViewSet

router = DefaultRouter()
router.register('buildings', ImmeubleViewSet, basename='building')

urlpatterns = [
    path('syndic/', include(router.urls)),
]
