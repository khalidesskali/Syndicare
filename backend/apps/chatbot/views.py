from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

from .serializers import ChatbotRequestSerializer
from .services.dialogflow_service import detect_intent
from .services.handlers import handle_dynamic_intent
from rest_framework.permissions import IsAuthenticated

import logging
import re

logger = logging.getLogger(__name__)

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json


class ChatbotAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChatbotRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data["message"]
        
        # Get authenticated user's ID
        user_id = request.user.id
        
        logger.info(f"User {user_id} sent message: {user_message}")
        
        # Call Dialogflow with explicit user_id
        dialogflow_response = detect_intent(
            text=user_message,
            user_id=user_id,  # Pass user_id explicitly
            language_code="en"
        )
        
        # Add user_id to response
        dialogflow_response['user_id'] = user_id
        
        logger.info(f"Dialogflow response: {dialogflow_response}")

        return Response(dialogflow_response, status=status.HTTP_200_OK)

@csrf_exempt
@require_http_methods(["POST"])
def dialogflow_webhook(request):
    """
    Dialogflow webhook endpoint - receives requests from Dialogflow
    """
    try:
        body = json.loads(request.body)
        
        logger.info("=" * 50)
        logger.info("WEBHOOK CALLED!")
        
        # Extract intent
        query_result = body.get("queryResult", {})
        intent = query_result.get("intent", {}).get("displayName", "")
        
        logger.info(f"Intent: {intent}")
        
        if not intent:
            return JsonResponse({
                "fulfillmentText": "I didn't understand your request."
            })
        
        # Extract user_id from session path
        session = body.get("session", "")
        logger.info(f"Session path: {session}")
        
        user_id = None
        
        # Extract user_id from session path
        # Format: "projects/syndic-app-483314/agent/sessions/user_123"
        match = re.search(r'/sessions/user_(\d+)', session)
        if match:
            try:
                user_id = int(match.group(1))
                logger.info(f"✅ Extracted user_id from session: {user_id}")
            except ValueError:
                logger.error(f"Failed to parse user_id from session: {session}")
        
        # If still no user_id, return error
        if not user_id:
            logger.error(f"❌ No user_id found in session: {session}")
            logger.error(f"Full request body: {json.dumps(body, indent=2)}")
            return JsonResponse({
                "fulfillmentText": "Authentication required. Please make sure you're logged in and try again."
            })
        
        logger.info(f"Using user_id: {user_id}")
        
        # Call handler with real user_id
        from .services.handlers import handle_dynamic_intent
        answer = handle_dynamic_intent(intent, user_id)
        
        logger.info(f"Response: {answer}")
        
        return JsonResponse({
            "fulfillmentText": answer
        })
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return JsonResponse({
            "fulfillmentText": "Sorry, I couldn't process that request."
        }, status=400)
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        return JsonResponse({
            "fulfillmentText": "Sorry, I'm having trouble processing your request."
        }, status=500)