from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from ..models import Reunion, User, Immeuble, Appartement
from ..serializers import ReunionSerializer
from ..permissions import IsResident

class ResidentReunionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for residents to view reunions for their building
    """
    permission_classes = [IsAuthenticated, IsResident]
    serializer_class = ReunionSerializer
    
    def get_queryset(self):
        """Return only reunions for the resident's building"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return Reunion.objects.none()
            
        if not self.request.user or not self.request.user.is_authenticated:
            return Reunion.objects.none()
        
        # Get the resident's apartment(s) and their buildings
        resident_buildings = Immeuble.objects.filter(
            appartements__resident=self.request.user
        ).distinct()
        
        return Reunion.objects.filter(
            immeuble__in=resident_buildings,
            status='SCHEDULED'
        ).select_related('immeuble', 'syndic').order_by('date_time')
    
    def list(self, request, *args, **kwargs):
        """
        List all scheduled reunions for resident's building
        GET /api/resident/reunions/
        """
        queryset = self.get_queryset()
        
        # Filter upcoming meetings only
        today = timezone.now()
        upcoming_reunions = queryset.filter(date_time__gte=today)
        
        serializer = self.get_serializer(upcoming_reunions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': upcoming_reunions.count()
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get reunion details
        GET /api/resident/reunions/{id}/
        """
        reunion = self.get_object()
        serializer = self.get_serializer(reunion)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming reunions
        GET /api/resident/reunions/upcoming/
        """
        queryset = self.get_queryset()
        today = timezone.now()
        upcoming_reunions = queryset.filter(date_time__gte=today)
        
        serializer = self.get_serializer(upcoming_reunions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': upcoming_reunions.count()
        })
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """
        Get past reunions
        GET /api/resident/reunions/past/
        """
        queryset = self.get_queryset()
        today = timezone.now()
        past_reunions = queryset.filter(date_time__lt=today)
        
        serializer = self.get_serializer(past_reunions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': past_reunions.count()
        })
