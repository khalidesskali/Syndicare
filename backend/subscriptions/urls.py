from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'admin/subscription-plans', views.SubscriptionPlanAdminViewSet, basename='admin-subscription-plans')
router.register(r'syndic/subscription-plans', views.SubscriptionPlanViewSet, basename='syndic-subscription-plans')
router.register(r'admin/subscriptions', views.SubscriptionAdminViewSet, basename='admin-subscriptions')
router.register(r'admin/payments', views.PaymentAdminViewSet, basename='admin-payments')

urlpatterns = [
    path('', include(router.urls)),
]