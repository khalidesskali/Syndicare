from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from ..serializers import UserSerializer
from ..permissions import IsAdmin, IsSyndic, IsResident

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    """
    Admin dashboard endpoint
    """
    return Response({
        'message': 'Welcome to Admin Dashboard',
        'user': UserSerializer(request.user).data
    })


@api_view(['GET'])
@permission_classes([IsSyndic])
def syndic_dashboard(request):
    """
    Syndic dashboard with subscription check
    """
    return Response({
        'message': 'Welcome to Syndic Dashboard',
        'user': UserSerializer(request.user).data,
        'has_valid_subscription': request.user.has_valid_subscription
    })


@api_view(['GET'])
@permission_classes([IsResident])
def resident_dashboard(request):
    """
    Resident dashboard endpoint
    """
    return Response({
        'message': 'Welcome to Resident Dashboard',
        'user': UserSerializer(request.user).data
    })
