from django.utils import timezone
from ..models import Reclamation, ReclamationStatusHistory
from apps.users.models import Notification

VALID_STATUS_TRANSITIONS = {
    'PENDING': ['IN_PROGRESS', 'REJECTED'],
    'IN_PROGRESS': ['RESOLVED'],
    'RESOLVED': [],
    'REJECTED': [],
}

def change_reclamation_status(reclamation, new_status, user, comment=""):
    old_status = reclamation.status
    if new_status == old_status:
        return reclamation

    allowed_transitions = VALID_STATUS_TRANSITIONS.get(old_status, [])
    if new_status not in allowed_transitions:
        raise ValueError(f"Invalid status transition from {old_status} to {new_status}")

    reclamation.status = new_status
    if new_status == 'RESOLVED':
        reclamation.closed_at = timezone.now()
    reclamation.save()

    ReclamationStatusHistory.objects.create(
        reclamation=reclamation, old_status=old_status, new_status=new_status,
        changed_by=user, comment=comment
    )

    Notification.objects.create(
        recipient=reclamation.resident,
        title="Reclamation Status Updated",
        message=f"Your reclamation '{reclamation.title}' is now {new_status}",
        type='RECLAMATION_UPDATED',
        related_entity_id=reclamation.id
    )
    return reclamation
