from rest_framework import serializers
from .models import Reclamation
from apps.apartments.models import Appartement

class ReclamationSerializer(serializers.ModelSerializer):
    """
    Serializer for Reclamation model
    """
    resident_email = serializers.EmailField(source='resident.email', read_only=True)
    resident_name = serializers.SerializerMethodField()
    apartment_number = serializers.CharField(source='appartement.number', read_only=True)
    building_name = serializers.CharField(source='appartement.immeuble.name', read_only=True)
    
    class Meta:
        model = Reclamation
        fields = [
            'id',
            'resident',
            'resident_email',
            'resident_name',
            'appartement',
            'apartment_number',
            'building_name',
            'title',
            'content',
            'status',
            'priority',
            'response',
            'category',
            'ai_urgency_level',
            'priority_score',
            'ai_summary',
            'suggested_department',
            'sentiment',
            'confidence_score',
            'ai_processed',
            'ai_processed_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'resident',
            'appartement',
            'created_at',
            'updated_at',
            'category',
            'ai_urgency_level',
            'priority_score',
            'ai_summary',
            'suggested_department',
            'sentiment',
            'confidence_score',
            'ai_processed',
            'ai_processed_at',
        ]
    
    def get_resident_name(self, obj):
        if obj.resident:
            return f"{obj.resident.first_name} {obj.resident.last_name}".strip() or obj.resident.email
        return None


class ResidentReclamationSerializer(serializers.ModelSerializer):
    """
    Serializer for residents to create reclamations
    """
    resident_name = serializers.SerializerMethodField()
    apartment_number = serializers.CharField(source='appartement.number', read_only=True)
    building_name = serializers.CharField(source='appartement.immeuble.name', read_only=True)

    class Meta:
        model = Reclamation
        fields = [
            'id',
            'resident_name',
            'syndic',
            'appartement',
            'apartment_number',
            'building_name',
            'title',
            'content',
            'status',
            'priority',
            'response',
            'category',
            'ai_urgency_level',
            'priority_score',
            'ai_summary',
            'suggested_department',
            'sentiment',
            'confidence_score',
            'ai_processed',
            'ai_processed_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'syndic',
            'resident',
            'appartement',
            'status',
            'priority',
            'response',
            'category',
            'ai_urgency_level',
            'priority_score',
            'ai_summary',
            'suggested_department',
            'sentiment',
            'confidence_score',
            'ai_processed',
            'ai_processed_at',
            'created_at',
            'updated_at',
        ]

    def get_resident_name(self, obj):
        return f"{obj.resident.first_name} {obj.resident.last_name}".strip()

    def create(self, validated_data):
        # Automatically set appartement and syndic to resident's building
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Try to get resident's primary apartment
            try:
                appartement = Appartement.objects.filter(resident=request.user).first()
                if appartement:
                    validated_data['appartement'] = appartement
                    # Get the syndic for this building
                    syndic = appartement.immeuble.syndic
                    if syndic:
                        validated_data['syndic'] = syndic
                    else:
                        raise serializers.ValidationError(
                            "No syndic assigned to this building. Please contact support."
                        )
                else:
                    # If no apartment found, raise an error
                    raise serializers.ValidationError(
                        "You must be assigned to an apartment to create a reclamation."
                    )
            except Exception:
                raise serializers.ValidationError(
                    "You must be assigned to an apartment to create a reclamation."
                )
        
        # Set resident to current user
        validated_data['resident'] = request.user
        
        return super().create(validated_data)
