@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        amount = payment_intent['amount'] / 100  # Convert from centimes to MAD
        currency = payment_intent['currency'].upper()
        # Handle successful payment
        # TODO: Update your database with the payment details
        print(f"Payment of {amount} {currency} succeeded")
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        # Handle failed payment
        error = payment_intent.get('last_payment_error', {})
        print(f"Payment failed: {error.get('message')}")
    
    return HttpResponse(status=200)