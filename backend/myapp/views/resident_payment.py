from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated

from ..models import Charge, ResidentPayment
from ..permissions import IsResident
from ..serializers import ResidentPaymentSerializer


class ResidentPaymentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsResident]
    
    def list(self, request):
        """
        List all payments made by the authenticated resident
        (across all apartments)
        """
        user = request.user
        
        payments = ResidentPayment.objects.filter(
            resident=user
        ).select_related('charge', 'appartement', 'syndic')
        
        serializer = ResidentPaymentSerializer(payments, many=True)
        
        return Response({
            'success': True,
            'count': payments.count(),
            'payments': serializer.data
        })
    
    
    def retrieve(self, request, pk=None):
        """
        View a single payment detail
        """
        payment = get_object_or_404(
            ResidentPayment,
            pk=pk,
            resident=request.user
        )
        
        return Response({
            'success': True,
            'payment': ResidentPaymentSerializer(payment).data
        })
