import stripe
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Initialize Stripe with your secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntent(APIView):
    """Create a PaymentIntent for a payment"""
    def post(self, request):
        try:
            # Get the amount from the request (in MAD)
            amount = int(float(request.data.get('amount')) * 100)  # Convert to centimes
            
            # Create a PaymentIntent with the order amount and currency
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='mad',  # MAD for Moroccan Dirham
                metadata={'integration_check': 'accept_a_payment'},
            )
            
            return Response({
                'clientSecret': intent['client_secret']
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PaymentStatus(APIView):
    """Check the status of a payment"""
    def get(self, request, payment_intent_id):
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return Response(payment_intent)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@require_http_methods(["POST"])
def confirm_payment(request):
    """Confirm a payment"""
    try:
        data = request.POST
        payment_intent_id = data.get('payment_intent_id')
        
        # Confirm the PaymentIntent
        payment_intent = stripe.PaymentIntent.confirm(
            payment_intent_id,
            payment_method=data.get('payment_method_id'),
        )
        
        return JsonResponse({
            'status': payment_intent.status,
            'payment_intent_id': payment_intent.id,
            'amount': payment_intent.amount / 100,  # Convert back to MAD
            'currency': payment_intent.currency.upper(),
        })
        
    except stripe.error.StripeError as e:
        return JsonResponse({'error': str(e)}, status=400)
