from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Reunion
from .serializers import ReunionSerializer
from apps.users.permissions import IsSyndic, IsResident
from apps.users.models import Notification
from apps.buildings.models import Immeuble
from apps.apartments.models import Appartement

User = get_user_model()

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
        return Reunion.objects.filter(syndic=self.request.user).select_related('immeuble').order_by('-date_time')
    
    def list(self, request, *args, **kwargs):
        """
        List all reunions for the syndic
        GET /api/syndic/reunions/
        """
        queryset = self.get_queryset()
        
        # Filter by building
        building_id = request.query_params.get('building_id', None)
        if building_id:
            queryset = queryset.filter(immeuble_id=building_id)
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(topic__icontains=search)
            )
        
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
            
            # Notify all residents in this building
            residents = User.objects.filter(
                role='RESIDENT',
                appartements__immeuble=reunion.immeuble
            ).distinct()
            
            for resident in residents:
                Notification.objects.create(
                    recipient=resident,
                    title='New Meeting Scheduled',
                    message=f'A new meeting "{reunion.title}" has been scheduled for {reunion.date_time.strftime("%Y-%m-%d %H:%M")}',
                    type='REUNION_SCHEDULED',
                    related_entity_id=reunion.id
                )

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
