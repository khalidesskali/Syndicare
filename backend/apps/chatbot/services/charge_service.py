from apps.payments.models import Charge
from django.utils import timezone

def explain_charges(user_id):
    """
    Get all charges for a user's apartment(s)
    """
    charges = Charge.objects.filter(appartement__resident_id=user_id)
    
    if not charges.exists():
        return "You currently have no charges."

    total = sum(c.amount for c in charges)
    paid_total = sum(c.paid_amount for c in charges)
    
    return (
        f"You have {charges.count()} charge(s). "
        f"Total amount: {total:.2f} MAD. "
        f"Already paid: {paid_total:.2f} MAD."
    )


def unpaid_charges_summary(user_id):
    """
    Get unpaid and overdue charges for a user
    """
    charges = Charge.objects.filter(
        appartement__resident_id=user_id,
        status__in=['UNPAID', 'OVERDUE', 'PARTIALLY_PAID']
    )

    if not charges.exists():
        return "You have no unpaid charges. You're all caught up! ✅"

    total = sum(c.amount for c in charges)
    paid_total = sum(c.paid_amount for c in charges)
    remaining = total - paid_total
    
    # Count overdue
    overdue_count = charges.filter(status='OVERDUE').count()
    
    response = (
        f"You have {charges.count()} unpaid charge(s). "
        f"Remaining to pay: {remaining:.2f} MAD."
    )
    
    if overdue_count > 0:
        response += f" ⚠️ Warning: {overdue_count} charge(s) are overdue!"
    
    return response