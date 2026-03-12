from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Appartement
from apps.users.models import ResidentProfile

User = get_user_model()

class AppartementSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='immeuble.name', read_only=True)
    building_address = serializers.CharField(source='immeuble.address', read_only=True)
    resident_email = serializers.EmailField(source='resident.email', read_only=True, allow_null=True)
    resident_name = serializers.SerializerMethodField()
    is_occupied = serializers.SerializerMethodField()
    
    class Meta:
        model = Appartement
        fields = [
            'id', 'immeuble', 'building_name', 'building_address',
            'number', 'floor', 'monthly_charge', 'resident',
            'resident_email', 'resident_name', 'is_occupied'
        ]
        read_only_fields = ['id']
    
    def get_resident_name(self, obj):
        if obj.resident:
            return f"{obj.resident.first_name} {obj.resident.last_name}".strip() or obj.resident.email
        return None
    
    def get_is_occupied(self, obj):
        return obj.resident is not None


class ResidentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    apartments = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'created_at', 'password', 'password2', 'apartments']
        read_only_fields = ['id', 'role', 'created_at']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def get_apartments(self, obj):
        return [{
            'id': apt.id, 'number': apt.number, 'building': apt.immeuble.name, 'monthly_charge': float(apt.monthly_charge)
        } for apt in obj.appartements.all()]
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password', None)
        validated_data['role'] = 'RESIDENT'
        validated_data['is_active'] = True
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        ResidentProfile.objects.create(user=user)
        return user


class ResidentUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    apartments = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'created_at', 'password', 'password2', 'apartments']
        read_only_fields = ['id', 'role', 'created_at']
    
    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        if password and password2 and password != password2:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if password and not password2:
            raise serializers.ValidationError({"password2": "Please confirm the password."})
        return attrs
    
    def get_apartments(self, obj):
        return [{
            'id': apt.id, 'number': apt.number, 'building': apt.immeuble.name, 'monthly_charge': float(apt.monthly_charge)
        } for apt in obj.appartements.all()]
