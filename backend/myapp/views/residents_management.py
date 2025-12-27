from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum

from ..models import User, Immeuble, Appartement, Reclamation, Charge, ResidentProfile
from ..serializers import UserSerializer, ResidentProfileSerializer, ResidentSerializer, ResidentUpdateSerializer
from ..permissions import IsSyndic



class ResidentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing residents by Syndic
    """
    permission_classes = [IsAuthenticated, IsSyndic]
    serializer_class = ResidentSerializer
    
    def get_queryset(self):
        """Return only residents created by the authenticated syndic"""
        # Handle swagger schema generation to prevent AnonymousUser errors
        if getattr(self, 'swagger_fake_view', False):
            return User.objects.none()
        
        if not self.request.user or not self.request.user.is_authenticated:
            return User.objects.none()
            
        # Return all residents (role='RESIDENT') since apartment assignment is now separate
        return User.objects.filter(
            role='RESIDENT'
        ).select_related('resident_profile').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        List all residents
        GET /api/syndic/residents/
        """
        queryset = self.get_queryset()
        
        # Search
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Filter by building
        building_id = request.query_params.get('building_id', None)
        if building_id:
            queryset = queryset.filter(appartements__immeuble_id=building_id)
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        """
        Create a new resident
        POST /api/syndic/residents/
        Body: {
            "email": "resident@example.com",
            "password": "SecurePass123",
            "password2": "SecurePass123",
            "first_name": "Ahmed",
            "last_name": "Hassan"
        }
        """
        data = request.data.copy()
        data['role'] = 'RESIDENT'
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            resident = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Resident created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get resident details
        GET /api/syndic/residents/{id}/
        """
        resident = self.get_object()
        serializer = self.get_serializer(resident)
        
        # Get apartments
        apartments = Appartement.objects.filter(resident=resident, immeuble__syndic=request.user)
        
        # Get unpaid charges
        unpaid_charges = Charge.objects.filter(
            appartement__resident=resident,
            appartement__immeuble__syndic=request.user,
            status__in=['UNPAID', 'OVERDUE', 'PARTIALLY_PAID']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        extra_info = {
            'apartments': [{'id': apt.id, 'number': apt.number, 'building': apt.immeuble.name} for apt in apartments],
            'unpaid_charges': float(unpaid_charges),
            'reclamations_count': Reclamation.objects.filter(resident=resident, syndic=request.user).count()
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'extra': extra_info
        })
    
    def update(self, request, *args, **kwargs):
        """
        Update resident
        PUT /api/syndic/residents/{id}/
        """
        partial = kwargs.pop('partial', False)
        resident = self.get_object()
        
        # Use ResidentUpdateSerializer for updates (password not required)
        serializer = ResidentUpdateSerializer(resident, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Resident updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update resident
        PATCH /api/syndic/residents/{id}/
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a resident
        DELETE /api/syndic/residents/{id}/
        """
        resident = self.get_object()
        
        # Clear the resident's apartment associations
        resident.appartements.clear()
        
        resident.delete()
        
        return Response({
            'success': True,
            'message': 'Resident deleted successfully'
        }, status=status.HTTP_200_OK)