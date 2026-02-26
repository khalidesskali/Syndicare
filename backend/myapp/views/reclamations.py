from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from ..models import Reclamation, ReclamationStatusHistory
from ..serializers import ReclamationSerializer
from ..permissions import IsSyndic
from ..services.ai_triage_service import process_reclamation_ai


# ==========================
# Lifecycle configuration
# ==========================

VALID_STATUS_TRANSITIONS = {
    'PENDING': ['IN_PROGRESS', 'REJECTED'],
    'IN_PROGRESS': ['RESOLVED'],
    'RESOLVED': [],
    'REJECTED': [],
}


def change_reclamation_status(reclamation, new_status, user, comment=""):
    """
    Centralized lifecycle logic for reclamations
    """
    old_status = reclamation.status

    if new_status == old_status:
        return reclamation

    allowed_transitions = VALID_STATUS_TRANSITIONS.get(old_status, [])
    if new_status not in allowed_transitions:
        raise ValueError(
            f"Invalid status transition from {old_status} to {new_status}"
        )

    reclamation.status = new_status

    if new_status == 'RESOLVED':
        reclamation.closed_at = timezone.now()

    reclamation.save()

    ReclamationStatusHistory.objects.create(
        reclamation=reclamation,
        old_status=old_status,
        new_status=new_status,
        changed_by=user,
        comment=comment
    )

    # 🔔 Notification hook (optional)
    # Notification.objects.create(
    #     user=reclamation.resident,
    #     message=f"Your reclamation '{reclamation.title}' is now {new_status}"
    # )

    return reclamation


# ==========================
# ViewSet
# ==========================

class ReclamationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reclamations by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ReclamationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Reclamation.objects.none()

        return Reclamation.objects.filter(
            syndic=self.request.user
        ).select_related(
            'resident', 'appartement', 'appartement__immeuble'
        ).order_by('-created_at')

    # ==========================
    # List & Retrieve
    # ==========================

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        status_filter = request.query_params.get('status')
        priority = request.query_params.get('priority')
        building_id = request.query_params.get('building_id')
        search = request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if priority:
            queryset = queryset.filter(priority=priority)

        if building_id:
            queryset = queryset.filter(appartement__immeuble_id=building_id)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(resident__email__icontains=search)
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        reclamation = self.get_object()
        serializer = self.get_serializer(reclamation)
        return Response({'success': True, 'data': serializer.data})

    # ==========================
    # Lifecycle Actions
    # ==========================

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """
        Change reclamation status with validation
        POST /change_status/
        """
        reclamation = self.get_object()
        new_status = request.data.get('status')
        comment = request.data.get('comment', '')

        if not new_status:
            return Response(
                {'success': False, 'message': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            change_reclamation_status(
                reclamation=reclamation,
                new_status=new_status,
                user=request.user,
                comment=comment
            )
        except ValueError as e:
            return Response(
                {'success': False, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'success': True,
            'message': 'Status updated successfully',
            'data': self.get_serializer(reclamation).data
        })

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """
        Respond to a reclamation and move it to IN_PROGRESS
        """
        reclamation = self.get_object()
        response_text = request.data.get('response')

        if not response_text:
            return Response(
                {'success': False, 'message': 'Response is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reclamation.response = response_text
        reclamation.save()

        try:
            change_reclamation_status(
                reclamation=reclamation,
                new_status='IN_PROGRESS',
                user=request.user,
                comment='Response sent to resident'
            )
        except ValueError:
            pass  # Already in progress

        return Response({
            'success': True,
            'message': 'Response sent successfully',
            'data': self.get_serializer(reclamation).data
        })

    # ==========================
    # History
    # ==========================

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get status change history
        """
        reclamation = self.get_object()
        history = reclamation.status_history.all()

        data = [
            {
                'old_status': h.old_status,
                'new_status': h.new_status,
                'comment': h.comment,
                'changed_at': h.changed_at,
                'changed_by': h.changed_by.email if h.changed_by else None
            }
            for h in history
        ]

        return Response({'success': True, 'data': data})

    @action(detail=True, methods=['post'])
    def triage_ai(self, request, pk=None):
        reclamation = self.get_object()

        try:
            process_reclamation_ai(reclamation.id)
            reclamation.refresh_from_db()
        except Exception:
            return Response(
                {'success': False, 'message': 'AI triage failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'success': True, 'data': self.get_serializer(reclamation).data})

    # ==========================
    # Statistics
    # ==========================

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        queryset = self.get_queryset()

        data = {
            'total': queryset.count(),
            'pending': queryset.filter(status='PENDING').count(),
            'in_progress': queryset.filter(status='IN_PROGRESS').count(),
            'resolved': queryset.filter(status='RESOLVED').count(),
            'rejected': queryset.filter(status='REJECTED').count(),
            'by_priority': {
                'urgent': queryset.filter(priority='URGENT').count(),
                'high': queryset.filter(priority='HIGH').count(),
                'medium': queryset.filter(priority='MEDIUM').count(),
                'low': queryset.filter(priority='LOW').count(),
            }
        }

        return Response({'success': True, 'data': data})
