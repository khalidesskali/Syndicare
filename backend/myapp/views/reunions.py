from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from ..models import Reunion, User, Immeuble
from ..serializers import ReunionSerializer
from ..permissions import IsSyndic

class ReunionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reunions by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ReunionSerializer
    
    def get_queryset(self):
        """Return only reunions created by the authenticated syndic"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return Reunion.objects.none()
            
        if not self.request.user or not self.request.user.is_authenticated:
            return Reunion.objects.none()
        return Reunion.objects.filter(syndic=self.request.user).select_related(
            'immeuble'
        ).order_by('-date_time')
    
    def list(self, request, *args, **kwargs):
        """
        List all reunions
        GET /api/syndic/reunions/
        """
        queryset = self.get_queryset()
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by building
        building_id = request.query_params.get('building_id', None)
        if building_id:
            queryset = queryset.filter(immeuble_id=building_id)
        
        # Filter upcoming/past
        filter_time = request.query_params.get('time', None)
        today = timezone.now()
        if filter_time == 'upcoming':
            queryset = queryset.filter(date_time__gte=today, status='SCHEDULED')
        elif filter_time == 'past':
            queryset = queryset.filter(date_time__lt=today)
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        """
        Create a new reunion
        POST /api/syndic/reunions/
        Body: {
            "immeuble": 1,
            "title": "Annual General Meeting",
            "topic": "Discussion of building maintenance...",
            "date_time": "2024-12-20T14:00:00Z",
            "location": "Building Lobby"
        }
        """
        # Verify building ownership
        building_id = request.data.get('immeuble')
        if not self._verify_building_ownership(building_id):
            return Response({
                'success': False,
                'message': 'Invalid building ID or you do not own this building'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            reunion = serializer.save(syndic=request.user)
            return Response({
                'success': True,
                'message': 'Reunion created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get reunion details
        GET /api/syndic/reunions/{id}/
        """
        reunion = self.get_object()
        serializer = self.get_serializer(reunion)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """
        Update reunion
        PUT /api/syndic/reunions/{id}/
        """
        partial = kwargs.pop('partial', False)
        reunion = self.get_object()
        serializer = self.get_serializer(reunion, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Reunion updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update reunion
        PATCH /api/syndic/reunions/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a reunion
        DELETE /api/syndic/reunions/{id}/
        """
        reunion = self.get_object()
        reunion.delete()
        
        return Response({
            'success': True,
            'message': 'Reunion deleted successfully'
        }, status=status.HTTP_200_OK)
    
    
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark reunion as completed
        POST /api/syndic/reunions/{id}/mark_completed/
        """
        reunion = self.get_object()
        reunion.status = 'COMPLETED'
        reunion.save()
        
        return Response({
            'success': True,
            'message': 'Reunion marked as completed',
            'data': self.get_serializer(reunion).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a reunion
        POST /api/syndic/reunions/{id}/cancel/
        """
        reunion = self.get_object()
        reunion.status = 'CANCELLED'
        reunion.save()
        
        return Response({
            'success': True,
            'message': 'Reunion cancelled',
            'data': self.get_serializer(reunion).data
        })
    
    def _verify_building_ownership(self, building_id):
        """Verify that the building belongs to the syndic"""
        if not building_id:
            return False
        return Immeuble.objects.filter(id=building_id, syndic=self.request.user).exists()
