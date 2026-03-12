from rest_framework import serializers
from .models import Charge, ChargePayment

class ChargeSerializer(serializers.ModelSerializer):
    """
    Serializer for Charge model
    """
    building_name = serializers.CharField(source='appartement.immeuble.name', read_only=True)
    apartment_number = serializers.CharField(source='appartement.number', read_only=True)
    total_amount = serializers.DecimalField(
        source='amount', 
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    paid_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    remaining_amount = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Charge
        fields = [
            'id',
            'appartement',
            'building_name',
            'apartment_number',
            'description',
            'amount',
            'total_amount',
            'paid_amount',
            'remaining_amount',
            'due_date',
            'status',
            'is_overdue',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_remaining_amount(self, obj):
        return obj.amount - obj.paid_amount


class ChargePaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for ChargePayment model
    """
    resident_email = serializers.EmailField(source='resident.email', read_only=True)
    resident_name = serializers.SerializerMethodField()
    syndic_email = serializers.EmailField(source='syndic.email', read_only=True)
    apartment_number = serializers.CharField(source='appartement.number', read_only=True)
    building_name = serializers.CharField(source='appartement.immeuble.name', read_only=True)
    
    class Meta:
        model = ChargePayment
        fields = [
            'id',
            'resident',
            'resident_email',
            'resident_name',
            'syndic',
            'syndic_email',
            'appartement',
            'apartment_number',
            'building_name',
            'charge',
            'amount',
            'payment_method',
            'status',
            'reference',
            'paid_at',
            'notes',
            'rib',
            'confirmed_at',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_resident_name(self, obj):
        if obj.resident:
            return f"{obj.resident.first_name} {obj.resident.last_name}".strip() or obj.resident.email
        return None
