import stripe
from typing import Dict, Optional
from django.conf import settings
from .base import PaymentGateway

class StripeGateway(PaymentGateway):
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def process_payment(self, amount: float, currency: str, **kwargs) -> Dict:
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),
                currency=currency.lower(),
                payment_method_types=['card'],
                metadata=kwargs.get('metadata', {})
            )
            return {
                'success': True,
                'payment_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'status': payment_intent.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'status': 'failed'
            }
    
    def get_payment_status(self, payment_id: str) -> Dict:
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            return {
                'success': True,
                'status': payment_intent.status,
                'amount': payment_intent.amount / 100,
                'currency': payment_intent.currency.upper()
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict:
        try:
            refund_params = {
                'payment_intent': payment_id,
            }
            if amount:
                refund_params['amount'] = int(amount * 100)
                
            refund = stripe.Refund.create(**refund_params)
            return {
                'success': True,
                'refund_id': refund.id,
                'status': refund.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }