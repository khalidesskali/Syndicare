from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone

from ..models import User, Immeuble, Appartement
from ..serializers import ImmeubleSerializer, AppartementSerializer, UserSerializer
from ..permissions import IsSyndic


class ImmeubleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing buildings by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ImmeubleSerializer
    
    def get_queryset(self):
        """Return only buildings owned by the authenticated syndic"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return Immeuble.objects.none()
            
        if not self.request.user or not self.request.user.is_authenticated:
            return Immeuble.objects.none()
        return Immeuble.objects.filter(syndic=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        List all buildings for the syndic
        GET /api/syndic/buildings/
        """
        queryset = self.get_queryset()
        
        # Search filter
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(address__icontains=search)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        """
        Create a new building
        POST /api/syndic/buildings/
        Body: {
            "name": "Residence Al Amal",
            "address": "123 Rue Mohammed V, Casablanca",
            "floors": 5
        }
        """
        # Check subscription limits
        if not self._check_building_limit():
            return Response({
                'success': False,
                'message': 'You have reached your building limit. Please upgrade your subscription.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            building = serializer.save(syndic=request.user)
            return Response({
                'success': True,
                'message': 'Building created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get building details with statistics
        GET /api/syndic/buildings/{id}/
        """
        building = self.get_object()
        serializer = self.get_serializer(building)
        
        # Get statistics
        appartements = building.appartements.all()
        stats = {
            'total_apartments': appartements.count(),
            'occupied_apartments': appartements.filter(resident__isnull=False).count(),
            'vacant_apartments': appartements.filter(resident__isnull=True).count(),
            'total_monthly_charges': appartements.aggregate(
                total=Sum('monthly_charge')
            )['total'] or 0
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'statistics': stats
        })
    
    def update(self, request, *args, **kwargs):
        """
        Update building information
        PUT /api/syndic/buildings/{id}/
        """
        partial = kwargs.pop('partial', False)
        building = self.get_object()
        serializer = self.get_serializer(building, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Building updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update building
        PATCH /api/syndic/buildings/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a building
        DELETE /api/syndic/buildings/{id}/
        """
        building = self.get_object()
        
        # Check if building has apartments
        if building.appartements.exists():
            return Response({
                'success': False,
                'message': 'Cannot delete building with existing apartments. Please remove all apartments first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        building.delete()
        
        return Response({
            'success': True,
            'message': 'Building deleted successfully'
        }, status=status.HTTP_200_OK)
    
    def _check_building_limit(self):
        """Check if syndic can create more buildings based on subscription"""
        try:
            subscription = self.request.user.syndic_profile.subscription
            if subscription.is_active:
                current_count = Immeuble.objects.filter(syndic=self.request.user).count()
                return current_count < subscription.plan.max_buildings
        except:
            pass
        return False
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get overall statistics for all buildings
        GET /api/syndic/buildings/statistics/
        """
        buildings = self.get_queryset()
        total_apartments = Appartement.objects.filter(immeuble__syndic=request.user).count()
        occupied = Appartement.objects.filter(immeuble__syndic=request.user, resident__isnull=False).count()
        
        stats = {
            'total_buildings': buildings.count(),
            'total_apartments': total_apartments,
            'occupied_apartments': occupied,
            'vacant_apartments': total_apartments - occupied,
            'occupancy_rate': round((occupied / total_apartments * 100), 1) if total_apartments > 0 else 0
        }
        
        return Response({
            'success': True,
            'data': stats
        })
