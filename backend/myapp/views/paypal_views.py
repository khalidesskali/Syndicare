"""
PayPal Payment Views
====================
Exposes four endpoints for the Syndic-side PayPal subscription payment flow:

  POST   /api/paypal/create-order/     – create a PayPal order & return approval_url
  POST   /api/paypal/capture-order/    – execute payment after user approves
  GET    /api/paypal/payment/<id>/     – fetch PayPal payment details
  POST   /api/paypal/refund/           – refund a completed PayPal payment
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils import timezone

from ..models import Subscription, SubscriptionPayment
from ..services.paypal_service import (
    create_paypal_order,
    capture_paypal_order,
    get_paypal_payment_details,
    refund_paypal_sale,
)
from ..permissions import IsAdmin


# ─────────────────────────────────────────────────────────
#  1. CREATE ORDER
#     Syndic initiates a PayPal checkout for their subscription.
# ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def paypal_create_order(request):
    """
    Create a PayPal payment order.

    Request body:
        {
            "subscription_id": 12,
            "return_url": "http://localhost:5173/paypal/success",
            "cancel_url": "http://localhost:5173/paypal/cancel"
        }

    Response:
        {
            "success": true,
            "approval_url": "https://www.sandbox.paypal.com/...",
            "payment_id":   "PAY-xxxxxxxxxx",
            "paypal_record_id": 7
        }
    """
    subscription_id = request.data.get('subscription_id')
    return_url = request.data.get('return_url')
    cancel_url = request.data.get('cancel_url')

    if not subscription_id or not return_url or not cancel_url:
        return Response({
            'success': False,
            'message': 'subscription_id, return_url, and cancel_url are required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Validate ownership – Syndic can only pay for their own subscription
    try:
        subscription = Subscription.objects.select_related('plan').get(
            id=subscription_id,
            syndic_profile__user=request.user
        )
    except Subscription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Subscription not found or does not belong to you.'
        }, status=status.HTTP_404_NOT_FOUND)

    amount = float(subscription.plan.price)
    currency = "USD"   # PayPal sandbox requires USD; update to MAD when live account supports it

    result = create_paypal_order(
        amount=amount,
        currency=currency,
        subscription_id=subscription_id,
        return_url=return_url,
        cancel_url=cancel_url,
    )

    if not result['success']:
        return Response({
            'success': False,
            'message': 'Failed to create PayPal order.',
            'paypal_error': result['error'],
        }, status=status.HTTP_502_BAD_GATEWAY)

    # Persist a PENDING payment record immediately so we can track it
    payment_record = SubscriptionPayment.objects.create(
        subscription=subscription,
        amount=amount,
        payment_method='PAYPAL',
        status='PENDING',
        reference=result['payment_id'],
        notes=f"PayPal order created. PaymentID={result['payment_id']}",
    )

    return Response({
        'success': True,
        'approval_url': result['approval_url'],
        'payment_id': result['payment_id'],
        'paypal_record_id': payment_record.id,
    }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────
#  2. CAPTURE ORDER
#     Called after PayPal redirects back with paymentId + PayerID.
# ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def paypal_capture_order(request):
    """
    Execute (capture) an approved PayPal payment.

    Request body:
        {
            "payment_id": "PAY-xxxxxxxxxx",
            "payer_id":   "ABCDEFGHIJKLM"
        }

    Response on success:
        {
            "success": true,
            "message": "Payment completed successfully.",
            "transaction_id": "...",
            "amount": "299.00",
            "currency": "USD"
        }
    """
    payment_id = request.data.get('payment_id')
    payer_id = request.data.get('payer_id')

    if not payment_id or not payer_id:
        return Response({
            'success': False,
            'message': 'payment_id and payer_id are required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    result = capture_paypal_order(payment_id=payment_id, payer_id=payer_id)

    if not result['success']:
        # Mark the pending record as FAILED
        SubscriptionPayment.objects.filter(reference=payment_id).update(
            status='FAILED',
            notes=f"PayPal capture failed: {result['error']}",
        )
        return Response({
            'success': False,
            'message': 'PayPal payment execution failed.',
            'paypal_error': result['error'],
        }, status=status.HTTP_502_BAD_GATEWAY)

    # Update the payment record to COMPLETED
    SubscriptionPayment.objects.filter(reference=payment_id).update(
        status='COMPLETED',
        reference=result['transaction_id'],   # store final transaction ID
        notes=(
            f"PayPal payment captured. "
            f"TransactionID={result['transaction_id']} "
            f"State={result['state']}"
        ),
    )

    return Response({
        'success': True,
        'message': 'Payment completed successfully.',
        'transaction_id': result['transaction_id'],
        'amount': result['amount'],
        'currency': result['currency'],
    })


# ─────────────────────────────────────────────────────────
#  3. GET PAYMENT DETAILS
#     Admin or Syndic can look up a PayPal payment by its PayPal ID.
# ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def paypal_payment_details(request, payment_id):
    """
    Fetch raw PayPal payment details.

    URL: GET /api/paypal/payment/<payment_id>/

    Response:
        { "success": true, "data": { ...paypal payment dict... } }
    """
    result = get_paypal_payment_details(payment_id=payment_id)

    if not result['success']:
        return Response({
            'success': False,
            'message': result['error'],
        }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'success': True,
        'data': result['data'],
    })


# ─────────────────────────────────────────────────────────
#  4. REFUND
#     Admin only – refund a captured PayPal payment.
# ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def paypal_refund(request):
    """
    Refund a completed PayPal payment (admin only).

    Request body:
        {
            "payment_record_id": 7,
            "amount": 299.00          // optional: partial refund; omit for full refund
        }

    Response:
        {
            "success": true,
            "refund_id": "...",
            "state": "completed"
        }
    """
    payment_record_id = request.data.get('payment_record_id')
    requested_amount = request.data.get('amount', None)

    if not payment_record_id:
        return Response({
            'success': False,
            'message': 'payment_record_id is required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment_record = SubscriptionPayment.objects.get(
            id=payment_record_id,
            payment_method='PAYPAL',
            status='COMPLETED',
        )
    except SubscriptionPayment.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Completed PayPal payment record not found.'
        }, status=status.HTTP_404_NOT_FOUND)

    amount = float(requested_amount) if requested_amount else float(payment_record.amount)
    currency = "USD"

    result = refund_paypal_sale(
        sale_id=payment_record.reference,
        amount=amount,
        currency=currency,
    )

    if not result['success']:
        return Response({
            'success': False,
            'message': 'PayPal refund failed.',
            'paypal_error': result['error'],
        }, status=status.HTTP_502_BAD_GATEWAY)

    # Update the payment record status
    payment_record.status = 'REFUNDED'
    payment_record.notes += f"\nRefunded {amount} {currency} on {timezone.now().date()} – RefundID: {result['refund_id']}"
    payment_record.processed_by = request.user
    payment_record.save()

    return Response({
        'success': True,
        'message': f'Refund of {amount} {currency} processed successfully.',
        'refund_id': result['refund_id'],
        'state': result['state'],
    })
