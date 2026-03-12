from rest_framework import serializers
from .models import Immeuble

class ImmeubleSerializer(serializers.ModelSerializer):
    syndic_email = serializers.EmailField(source='syndic.email', read_only=True)
    total_apartments = serializers.SerializerMethodField()
    occupied_apartments = serializers.SerializerMethodField()
    
    class Meta:
        model = Immeuble
        fields = [
            'id', 'name', 'address', 'floors', 'syndic', 'syndic_email',
            'total_apartments', 'occupied_apartments', 'created_at'
        ]
        read_only_fields = ['id', 'syndic', 'created_at']
    
    def get_total_apartments(self, obj):
        return obj.appartements.count()
    
    def get_occupied_apartments(self, obj):
        return obj.appartements.filter(resident__isnull=False).count()

class ImmeubleDetailSerializer(ImmeubleSerializer):
    appartements = serializers.SerializerMethodField()
    
    class Meta(ImmeubleSerializer.Meta):
        fields = ImmeubleSerializer.Meta.fields + ['appartements']
    
    def get_appartements(self, obj):
        return [{
            'id': apt.id,
            'number': apt.number,
            'floor': apt.floor,
            'is_occupied': apt.resident is not None
        } for apt in obj.appartements.all()]
