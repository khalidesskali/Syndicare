from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.db.models import Q
from django.utils import timezone
import logging

from ..models import Reclamation, ReclamationStatusHistory, Appartement, Immeuble
from ..permissions import IsResident
from ..services.ai_triage_service import process_reclamation_ai


logger = logging.getLogger(__name__)


class ResidentReclamationSerializer(serializers.ModelSerializer):
    """
    Serializer for Reclamation model for resident use
    """
    resident_email = serializers.EmailField(source='resident.email', read_only=True)
    resident_name = serializers.SerializerMethodField()
    apartment_number = serializers.CharField(source='appartement.number', read_only=True)
    building_name = serializers.CharField(source='appartement.immeuble.name', read_only=True)
    
    class Meta:
        model = Reclamation
        fields = [
            'id',
            'resident',
            'resident_email',
            'resident_name',
            'syndic',
            'appartement',
            'apartment_number',
            'building_name',
            'title',
            'content',
            'status',
            'priority',
            'response',
            'category',
            'ai_urgency_level',
            'priority_score',
            'ai_summary',
            'suggested_department',
            'sentiment',
            'confidence_score',
            'ai_processed',
            'ai_processed_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'syndic',
            'resident',
            'appartement',
            'status',
            'priority',
            'response',
            'category',
            'ai_urgency_level',
            'priority_score',
            'ai_summary',
            'suggested_department',
            'sentiment',
            'confidence_score',
            'ai_processed',
            'ai_processed_at',
            'created_at',
            'updated_at',
        ]

    def get_resident_name(self, obj):
        return f"{obj.resident.first_name} {obj.resident.last_name}".strip()

    def create(self, validated_data):
        # Automatically set appartement and syndic to resident's building
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Try to get resident's primary apartment
            try:
                appartement = Appartement.objects.filter(resident=request.user).first()
                if appartement:
                    validated_data['appartement'] = appartement
                    # Get the syndic for this building
                    syndic = appartement.immeuble.syndic
                    if syndic:
                        validated_data['syndic'] = syndic
                    else:
                        raise serializers.ValidationError(
                            "No syndic assigned to this building. Please contact support."
                        )
                else:
                    # If no apartment found, raise an error
                    raise serializers.ValidationError(
                        "You must be assigned to an apartment to create a reclamation."
                    )
            except Appartement.DoesNotExist:
                raise serializers.ValidationError(
                    "You must be assigned to an apartment to create a reclamation."
                )
        
        # Set resident to current user
        validated_data['resident'] = request.user
        
        return super().create(validated_data)


class ResidentReclamationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reclamations by Residents
    """
    permission_classes = [IsAuthenticated, IsResident]
    serializer_class = ResidentReclamationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Reclamation.objects.none()

        return Reclamation.objects.filter(
            resident=self.request.user
        ).select_related(
            'appartement', 'appartement__immeuble'
        ).order_by('-created_at')

    # ==========================
    # List & Retrieve
    # ==========================

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        status_filter = request.query_params.get('status')
        priority = request.query_params.get('priority')
        search = request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if priority:
            queryset = queryset.filter(priority=priority)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        return Response({
            'success': True,
            'message': 'Reclamation created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # This is handled by the serializer's create method
        reclamation = serializer.save()
        try:
            process_reclamation_ai(reclamation.id)
            reclamation.refresh_from_db()
        except Exception:
            logger.exception("AI triage failed during resident reclamation create (reclamation_id=%s)", reclamation.id)

    # ==========================
    # Delete (status-restricted)
    # ==========================

    def destroy(self, request, *args, **kwargs):
        """
        Allow residents to delete their own reclamations ONLY if the status is PENDING.
        Once a complaint moves beyond PENDING it becomes part of the audit trail
        and can no longer be removed by the resident.
        """
        reclamation = self.get_object()

        if reclamation.status != 'PENDING':
            return Response(
                {
                    'success': False,
                    'message': (
                        f"Cannot delete a complaint with status '{reclamation.status}'. "
                        "Only complaints that are still PENDING can be deleted."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        reclamation.delete()
        return Response(
            {'success': True, 'message': 'Complaint deleted successfully.'},
            status=status.HTTP_200_OK,
        )

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
                'high': queryset.filter(priority='HIGH').count(),
                'medium': queryset.filter(priority='MEDIUM').count(),
                'low': queryset.filter(priority='LOW').count(),
            }
        }

        return Response({'success': True, 'data': data})

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
