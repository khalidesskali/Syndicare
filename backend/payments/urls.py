from django.urls import path
from . import views, webhooks

urlpatterns = [
    # API Endpoints
    path('create-payment-intent/', views.CreatePaymentIntent.as_view(), name='create_payment_intent'),
    path('payment-status/<str:payment_intent_id>/', views.PaymentStatus.as_view(), name='payment_status'),
    path('confirm-payment/', views.confirm_payment, name='confirm_payment'),
    
    # Webhook
    path('webhooks/stripe/', webhooks.stripe_webhook, name='stripe_webhook'),
]