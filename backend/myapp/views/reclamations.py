from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from ..models import Reclamation
from ..serializers import ReclamationSerializer
from ..permissions import IsSyndic

class ReclamationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reclamations by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ReclamationSerializer
    
    def get_queryset(self):
        """Return only reclamations for the authenticated syndic"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return Reclamation.objects.none()
            
        if not self.request.user or not self.request.user.is_authenticated:
            return Reclamation.objects.none()
        return Reclamation.objects.filter(syndic=self.request.user).select_related(
            'resident', 'appartement', 'appartement__immeuble'
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        List all reclamations
        GET /api/syndic/reclamations/
        """
        queryset = self.get_queryset()
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority = request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by building
        building_id = request.query_params.get('building_id', None)
        if building_id:
            queryset = queryset.filter(appartement__immeuble_id=building_id)
        
        # Search
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(resident__email__icontains=search)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get reclamation details
        GET /api/syndic/reclamations/{id}/
        """
        reclamation = self.get_object()
        serializer = self.get_serializer(reclamation)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """
        Update reclamation (status and response)
        PUT /api/syndic/reclamations/{id}/
        """
        partial = kwargs.pop('partial', False)
        reclamation = self.get_object()
        serializer = self.get_serializer(reclamation, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Reclamation updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update reclamation
        PATCH /api/syndic/reclamations/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """
        Respond to a reclamation
        POST /api/syndic/reclamations/{id}/respond/
        Body: {
            "response": "Your issue has been noted...",
            "status": "IN_PROGRESS"
        }
        """
        reclamation = self.get_object()
        response_text = request.data.get('response')
        new_status = request.data.get('status', 'IN_PROGRESS')
        
        if not response_text:
            return Response({
                'success': False,
                'message': 'Response text is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reclamation.response = response_text
        reclamation.status = new_status
        reclamation.save()
        
        return Response({
            'success': True,
            'message': 'Response submitted successfully',
            'data': self.get_serializer(reclamation).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_resolved(self, request, pk=None):
        """
        Mark reclamation as resolved
        POST /api/syndic/reclamations/{id}/mark_resolved/
        """
        reclamation = self.get_object()
        reclamation.status = 'RESOLVED'
        reclamation.save()
        
        return Response({
            'success': True,
            'message': 'Reclamation marked as resolved',
            'data': self.get_serializer(reclamation).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_in_progress(self, request, pk=None):
        """
        Mark reclamation as in progress
        POST /api/syndic/reclamations/{id}/mark_in_progress/
        """
        reclamation = self.get_object()
        reclamation.status = 'IN_PROGRESS'
        reclamation.save()
        
        return Response({
            'success': True,
            'message': 'Reclamation marked as in progress',
            'data': self.get_serializer(reclamation).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a reclamation
        POST /api/syndic/reclamations/{id}/reject/
        Body: {"response": "Reason for rejection"}
        """
        reclamation = self.get_object()
        response_text = request.data.get('response')
        
        if not response_text:
            return Response({
                'success': False,
                'message': 'Rejection reason is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reclamation.response = response_text
        reclamation.status = 'REJECTED'
        reclamation.save()
        
        return Response({
            'success': True,
            'message': 'Reclamation rejected',
            'data': self.get_serializer(reclamation).data
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get reclamation statistics
        GET /api/syndic/reclamations/statistics/
        """
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'pending': queryset.filter(status='PENDING').count(),
            'in_progress': queryset.filter(status='IN_PROGRESS').count(),
            'resolved': queryset.filter(status='RESOLVED').count(),
            'rejected': queryset.filter(status='REJECTED').count(),
            'by_priority': {
                'urgent': queryset.filter(priority='URGENT').count(),
                'high': queryset.filter(priority='HIGH').count(),
                'medium': queryset.filter(priority='MEDIUM').count(),
                'low': queryset.filter(priority='LOW').count()
            }
        }
        
        return Response({
            'success': True,
            'data': stats
        })
