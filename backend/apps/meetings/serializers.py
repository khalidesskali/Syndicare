from rest_framework import serializers
from .models import Reunion

class ReunionSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='immeuble.name', read_only=True)
    
    class Meta:
        model = Reunion
        fields = [
            'id', 'immeuble', 'building_name', 'title', 'topic',
            'date_time', 'location', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ResidentReunionSerializer(ReunionSerializer):
    class Meta(ReunionSerializer.Meta):
        fields = ReunionSerializer.Meta.fields
