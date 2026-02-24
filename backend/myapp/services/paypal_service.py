"""
PayPal Service Layer
====================
Wraps `paypalrestsdk` to provide a clean, testable interface
for creating, capturing, and refunding PayPal orders.

All methods return a dict:
    { "success": bool, "data": {...} | None, "error": str | None }
"""

import paypalrestsdk
from django.conf import settings


def _get_api() -> paypalrestsdk.Api:
    """Return a configured paypalrestsdk API object (lazy initialisation)."""
    return paypalrestsdk.Api({
        "mode": settings.PAYPAL_MODE,           # "sandbox" | "live"
        "client_id": settings.PAYPAL_CLIENT_ID,
        "client_secret": settings.PAYPAL_CLIENT_SECRET,
    })


def create_paypal_order(amount: float, currency: str, subscription_id: int, return_url: str, cancel_url: str) -> dict:
    """
    Create a PayPal Payment (order) that redirects the user to PayPal
    for approval.

    Parameters
    ----------
    amount          : float  – e.g. 299.00
    currency        : str    – ISO 4217 code, e.g. "USD" or "MAD"
    subscription_id : int    – internal Subscription PK (stored in custom_id)
    return_url      : str    – URL PayPal redirects to after approval
    cancel_url      : str    – URL PayPal redirects to if user cancels

    Returns
    -------
    dict with keys: success, approval_url, payment_id, error
    """
    api = _get_api()

    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
        "transactions": [{
            "amount": {
                "total": f"{amount:.2f}",
                "currency": currency,
            },
            "description": f"SyndiCare subscription payment (ID: {subscription_id})",
            "custom": str(subscription_id),   # stored for reference after capture
            "invoice_number": f"SUB-{subscription_id}",
        }]
    }, api=api)

    if payment.create():
        # Extract the approval URL that the user must visit
        approval_url = next(
            (link.href for link in payment.links if link.rel == "approval_url"),
            None
        )
        return {
            "success": True,
            "approval_url": approval_url,
            "payment_id": payment.id,
            "error": None,
        }
    else:
        return {
            "success": False,
            "approval_url": None,
            "payment_id": None,
            "error": payment.error,
        }


def capture_paypal_order(payment_id: str, payer_id: str) -> dict:
    """
    Execute (capture) a PayPal payment after the user approved it.

    Parameters
    ----------
    payment_id : str – PayPal payment ID returned by create_paypal_order
    payer_id   : str – PayerID query-param from PayPal's return redirect

    Returns
    -------
    dict with keys: success, transaction_id, amount, currency, error
    """
    api = _get_api()

    try:
        payment = paypalrestsdk.Payment.find(payment_id, api=api)
    except paypalrestsdk.exceptions.ResourceNotFound:
        return {"success": False, "error": f"Payment {payment_id} not found on PayPal."}

    if payment.execute({"payer_id": payer_id}):
        # Extract the sale transaction details
        tx = payment.transactions[0].related_resources[0].sale
        return {
            "success": True,
            "transaction_id": tx.id,
            "amount": tx.amount.total,
            "currency": tx.amount.currency,
            "state": tx.state,
            "error": None,
        }
    else:
        return {
            "success": False,
            "transaction_id": None,
            "error": payment.error,
        }


def get_paypal_payment_details(payment_id: str) -> dict:
    """
    Fetch the full details of a PayPal payment by its payment_id.

    Returns
    -------
    dict with keys: success, data (raw PayPal dict), error
    """
    api = _get_api()
    try:
        payment = paypalrestsdk.Payment.find(payment_id, api=api)
        return {"success": True, "data": payment.to_dict(), "error": None}
    except paypalrestsdk.exceptions.ResourceNotFound:
        return {"success": False, "data": None, "error": f"Payment {payment_id} not found."}
    except Exception as exc:
        return {"success": False, "data": None, "error": str(exc)}


def refund_paypal_sale(sale_id: str, amount: float, currency: str) -> dict:
    """
    Refund a captured PayPal sale (full or partial).

    Parameters
    ----------
    sale_id  : str   – The sale ID (from transaction_id after capture)
    amount   : float – Amount to refund
    currency : str   – ISO 4217 currency code

    Returns
    -------
    dict with keys: success, refund_id, state, error
    """
    api = _get_api()
    try:
        sale = paypalrestsdk.Sale.find(sale_id, api=api)
        refund = sale.refund({
            "amount": {
                "total": f"{amount:.2f}",
                "currency": currency,
            }
        })
        if refund.success():
            return {
                "success": True,
                "refund_id": refund.id,
                "state": refund.state,
                "error": None,
            }
        else:
            return {"success": False, "refund_id": None, "state": None, "error": refund.error}
    except paypalrestsdk.exceptions.ResourceNotFound:
        return {"success": False, "refund_id": None, "state": None, "error": f"Sale {sale_id} not found."}
    except Exception as exc:
        return {"success": False, "refund_id": None, "state": None, "error": str(exc)}
