from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import (
    Immeuble, Appartement, Reclamation, Reunion, 
    Charge, ChargePayment, 
    ResidentProfile, User, SyndicProfile, Notification
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['email'] = user.email
        token['role'] = user.role
        token['is_active'] = user.is_active
        
        return token
    
    def validate(self, attrs):
        # Check if user is active before authentication
        email = attrs.get('email')
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                raise serializers.ValidationError({
                    'detail': 'Account is inactive. Please contact administrator.'
                })
        except User.DoesNotExist:
            pass  # Let the parent handle invalid credentials
        
        data = super().validate(attrs)
        
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_active': self.user.is_active,
        }
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for user details
    """
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for user registration with strong validation
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        validators=[validate_password]  # Use Django's password validators
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}, 
        label='Confirm Password'
    )
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    
    def create(self, validated_data):
        """Create user with hashed password and auto-set SYNDIC role"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Hardcode role to SYNDIC for self-registration
        user = User(**validated_data)
        user.role = 'SYNDIC'
        user.set_password(password)
        
        # Set created_by if available (usually None for self-reg)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            user.created_by = request.user
        
        user.save()
        
        # Auto-create syndic profile
        SyndicProfile.objects.create(user=user)
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Enhanced serializer for password change with validation
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        """Verify old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate new passwords match and differ from old"""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from old password."
            })
        
        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout to blacklist refresh token
    """
    refresh = serializers.CharField()
    
    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except Exception as e:
            raise serializers.ValidationError({'detail': 'Invalid or expired token.'})


# ============================================
# CHARGE PAYMENT SERIALIZERS
# ============================================


class ChargePaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for ChargePayment model
    """
    resident_email = serializers.EmailField(source='resident.email', read_only=True)
    resident_name = serializers.SerializerMethodField()
    syndic_email = serializers.EmailField(source='syndic.email', read_only=True)
    apartment_number = serializers.CharField(source='appartement.number', read_only=True)
    building_name = serializers.CharField(source='appartement.immeuble.name', read_only=True)
    charge_title = serializers.CharField(source='charge.title', read_only=True)
    
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
            'charge_title',
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


# ============================================
# BUILDING SERIALIZERS
# ============================================

class ImmeubleSerializer(serializers.ModelSerializer):
    """
    Serializer for Immeuble (Building) model
    """
    syndic_email = serializers.EmailField(source='syndic.email', read_only=True)
    total_apartments = serializers.SerializerMethodField()
    occupied_apartments = serializers.SerializerMethodField()
    
    class Meta:
        model = Immeuble
        fields = [
            'id',
            'name',
            'address',
            'floors',
            'syndic',
            'syndic_email',
            'total_apartments',
            'occupied_apartments',
            'created_at'
        ]
        read_only_fields = ['id', 'syndic', 'created_at']
    
    def get_total_apartments(self, obj):
        return obj.appartements.count()
    
    def get_occupied_apartments(self, obj):
        return obj.appartements.filter(resident__isnull=False).count()


class ImmeubleDetailSerializer(ImmeubleSerializer):
    """
    Detailed serializer for Immeuble with apartment list
    """
    appartements = serializers.SerializerMethodField()
    
    class Meta(ImmeubleSerializer.Meta):
        fields = ImmeubleSerializer.Meta.fields + ['appartements']
    
    def get_appartements(self, obj):
        apartments = obj.appartements.all()
        return [{
            'id': apt.id,
            'number': apt.number,
            'floor': apt.floor,
            'is_occupied': apt.resident is not None
        } for apt in apartments]


# ============================================
# APARTMENT SERIALIZERS
# ============================================

class AppartementSerializer(serializers.ModelSerializer):
    """
    Serializer for Appartement (Apartment) model
    """
    building_name = serializers.CharField(source='immeuble.name', read_only=True)
    building_address = serializers.CharField(source='immeuble.address', read_only=True)
    resident_email = serializers.EmailField(source='resident.email', read_only=True, allow_null=True)
    resident_name = serializers.SerializerMethodField()
    is_occupied = serializers.SerializerMethodField()
    
    class Meta:
        model = Appartement
        fields = [
            'id',
            'immeuble',
            'building_name',
            'building_address',
            'number',
            'floor',
            'monthly_charge',
            'resident',
            'resident_email',
            'resident_name',
            'is_occupied'
        ]
        read_only_fields = ['id']
    
    def get_resident_name(self, obj):
        if obj.resident:
            return f"{obj.resident.first_name} {obj.resident.last_name}".strip() or obj.resident.email
        return None
    
    def get_is_occupied(self, obj):
        return obj.resident is not None


# ============================================
# RESIDENT SERIALIZERS
# ============================================

class ResidentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for ResidentProfile model
    """
    class Meta:
        model = ResidentProfile
        fields = ['id']
        read_only_fields = ['id']


class ResidentSerializer(serializers.ModelSerializer):
    """
    Serializer for Resident users
    """
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    apartments = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'created_at',
            'password',
            'password2',
            'apartments'
        ]
        read_only_fields = ['id', 'role', 'created_at']
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def get_apartments(self, obj):
        apartments = obj.appartements.all()
        return [{
            'id': apt.id,
            'number': apt.number,
            'building': apt.immeuble.name,
            'monthly_charge': float(apt.monthly_charge)
        } for apt in apartments]
    
    def create(self, validated_data):
        validated_data.pop('password2')  # Remove password2
        password = validated_data.pop('password', None)
        validated_data['role'] = 'RESIDENT'
        validated_data['is_active'] = True  # Set is_active to True by default
        
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        # Create resident profile
        ResidentProfile.objects.create(user=user)
        
        return user


class ResidentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating Resident users (password not required)
    """
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    apartments = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'created_at',
            'password',
            'password2',
            'apartments'
        ]
        read_only_fields = ['id', 'role', 'created_at']
    
    def validate(self, attrs):
        """Validate passwords match only if both are provided"""
        password = attrs.get('password')
        password2 = attrs.get('password2')
        
        if password and password2 and password != password2:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # If only one password field is provided, require both
        if password and not password2:
            raise serializers.ValidationError({
                "password2": "Please confirm the password."
            })
        
        if password2 and not password:
            raise serializers.ValidationError({
                "password": "Please provide password."
            })
        
        return attrs
    
    def get_apartments(self, obj):
        apartments = obj.appartements.all()
        return [{
            'id': apt.id,
            'number': apt.number,
            'building': apt.immeuble.name,
            'monthly_charge': float(apt.monthly_charge)
        } for apt in apartments]


# ============================================
# CHARGE SERIALIZERS
# ============================================

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


# ============================================
# RECLAMATION SERIALIZERS
# ============================================

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
    class Meta:
        model = Reclamation
        fields = [
            'appartement',
            'title',
            'content',
            'status',
            'priority',
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

        read_only_fields = [
            'status',
            'priority',
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
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['resident'] = user
        return super().create(validated_data)


# ============================================
# REUNION SERIALIZERS
# ============================================

class ReunionSerializer(serializers.ModelSerializer):
    """
    Serializer for Reunion model
    """
    building_name = serializers.CharField(source='immeuble.name', read_only=True)
    
    class Meta:
        model = Reunion
        fields = [
            'id',
            'immeuble',
            'building_name',
            'title',
            'topic',
            'date_time',
            'location',
            'status',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ResidentReunionSerializer(ReunionSerializer):
    """
    Serializer for residents to view reunions
    """
    class Meta(ReunionSerializer.Meta):
        fields = ReunionSerializer.Meta.fields

# ============================================
# NOTIFICATION SERIALIZERS
# ============================================

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'title',
            'message',
            'type',
            'read',
            'related_entity_id',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'recipient']
