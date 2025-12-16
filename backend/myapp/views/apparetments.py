from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum

from ..models import User, Immeuble, Appartement, Charge, Reclamation
from ..serializers import ImmeubleSerializer, AppartementSerializer, UserSerializer
from ..permissions import IsSyndic


class AppartementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing apartments by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = AppartementSerializer
    
    def get_queryset(self):
        """Return only apartments in buildings owned by the authenticated syndic"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return Appartement.objects.none()
            
        if not self.request.user or not self.request.user.is_authenticated:
            return Appartement.objects.none()
        return Appartement.objects.filter(immeuble__syndic=self.request.user).select_related(
            'immeuble', 'resident'
        ).order_by('immeuble', 'floor', 'number')
    
    def list(self, request, *args, **kwargs):
        """
        List all apartments for the syndic
        GET /api/syndic/apartments/
        """
        queryset = self.get_queryset()
        
        # Filter by building
        building_id = request.query_params.get('building_id', None)
        if building_id:
            queryset = queryset.filter(immeuble_id=building_id)
        
        # Filter by occupancy
        is_occupied = request.query_params.get('is_occupied', None)
        if is_occupied == 'true':
            queryset = queryset.filter(resident__isnull=False)
        elif is_occupied == 'false':
            queryset = queryset.filter(resident__isnull=True)
        
        # Search
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(number__icontains=search) |
                Q(immeuble__name__icontains=search)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        """
        Create a new apartment
        POST /api/syndic/apartments/
        Body: {
            "immeuble": 1,
            "number": "101",
            "floor": 1,
            "surface_area": 85.5,
            "monthly_charge": 500.00
        }
        """
        # Check subscription limits
        if not self._check_apartment_limit():
            return Response({
                'success': False,
                'message': 'You have reached your apartment limit. Please upgrade your subscription.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verify building ownership
        building_id = request.data.get('immeuble')
        if not self._verify_building_ownership(building_id):
            return Response({
                'success': False,
                'message': 'Invalid building ID or you do not own this building'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            apartment = serializer.save()
            return Response({
                'success': True,
                'message': 'Apartment created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get apartment details
        GET /api/syndic/apartments/{id}/
        """
        apartment = self.get_object()
        serializer = self.get_serializer(apartment)
        
        # Get additional info
        unpaid_charges = Charge.objects.filter(
            appartement=apartment,
            status__in=['UNPAID', 'OVERDUE', 'PARTIALLY_PAID']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        extra_info = {
            'unpaid_charges': float(unpaid_charges),
            'total_charges': Charge.objects.filter(appartement=apartment).count(),
            'reclamations_count': apartment.reclamations.count()
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'extra': extra_info
        })
    
    def update(self, request, *args, **kwargs):
        """
        Update apartment
        PUT /api/syndic/apartments/{id}/
        """
        partial = kwargs.pop('partial', False)
        apartment = self.get_object()
        serializer = self.get_serializer(apartment, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Apartment updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update apartment
        PATCH /api/syndic/apartments/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an apartment
        DELETE /api/syndic/apartments/{id}/
        """
        apartment = self.get_object()
        
        # Check if apartment has a resident
        if apartment.resident:
            return Response({
                'success': False,
                'message': 'Cannot delete apartment with assigned resident. Remove resident first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        apartment.delete()
        
        return Response({
            'success': True,
            'message': 'Apartment deleted successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def assign_resident(self, request, pk=None):
        """
        Assign a resident to an apartment
        POST /api/syndic/apartments/{id}/assign_resident/
        Body: {"resident_id": 5}
        """
        apartment = self.get_object()
        resident_id = request.data.get('resident_id')
        
        if not resident_id:
            return Response({
                'success': False,
                'message': 'Resident ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            resident = User.objects.get(id=resident_id, role='RESIDENT')
            apartment.resident = resident
            apartment.save()
            
            return Response({
                'success': True,
                'message': 'Resident assigned successfully',
                'data': self.get_serializer(apartment).data
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Resident not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def remove_resident(self, request, pk=None):
        """
        Remove resident from apartment
        POST /api/syndic/apartments/{id}/remove_resident/
        """
        apartment = self.get_object()
        apartment.resident = None
        apartment.save()
        
        return Response({
            'success': True,
            'message': 'Resident removed successfully',
            'data': self.get_serializer(apartment).data
        })
    
    def _check_apartment_limit(self):
        """Check if syndic can create more apartments based on subscription"""
        try:
            subscription = self.request.user.syndic_profile.subscription
            if subscription.is_active:
                current_count = Appartement.objects.filter(immeuble__syndic=self.request.user).count()
                return current_count < subscription.plan.max_apartments
        except:
            pass
        return False
    
    def _verify_building_ownership(self, building_id):
        """Verify that the building belongs to the syndic"""
        if not building_id:
            return False
        return Immeuble.objects.filter(id=building_id, syndic=self.request.user).exists()
