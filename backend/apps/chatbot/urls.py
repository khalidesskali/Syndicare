from django.urls import path
from .views import ChatbotAPIView, dialogflow_webhook

urlpatterns = [
    path("chat/", ChatbotAPIView.as_view(), name="chat"),
    path("dialogflow/webhook/", dialogflow_webhook, name="dialogflow-webhook"),
]
