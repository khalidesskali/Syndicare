from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['is_active'] = user.is_active
        
        # Add subscription info for Syndics
        if user.is_syndic:
            token['has_valid_subscription'] = user.has_valid_subscription
        
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
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'phone': self.user.phone,
            'is_active': self.user.is_active,
        }
        
        # Add subscription info for Syndics
        if self.user.is_syndic:
            data['user']['has_valid_subscription'] = self.user.has_valid_subscription
            try:
                subscription = self.user.syndic_profile.subscription
                data['user']['subscription'] = {
                    'plan_name': subscription.plan.name,
                    'status': subscription.status,
                    'days_remaining': subscription.days_remaining,
                    'end_date': str(subscription.end_date),
                }
            except:
                data['user']['subscription'] = None
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for user details
    """
    has_valid_subscription = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 
                  'is_active', 'created_at', 'has_valid_subscription']
        read_only_fields = ['id', 'created_at', 'has_valid_subscription']
    
    def get_has_valid_subscription(self, obj):
        if obj.is_syndic:
            return obj.has_valid_subscription
        return None


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
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'role']
    
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
    
    def validate_role(self, value):
        """Validate role permissions"""
        request = self.context.get('request')
        
        # Only Admin can create Admin or Syndic accounts
        if value in ['ADMIN', 'SYNDIC']:
            if not (request and request.user and request.user.is_authenticated and request.user.is_admin):
                raise serializers.ValidationError(
                    "Only administrators can create Syndic or Admin accounts."
                )
        
        return value
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        
        # Set created_by if available
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            user.created_by = request.user
        
        user.save()
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


from rest_framework import serializers
from .models import (
    User, SyndicProfile, SubscriptionPlan, Subscription, 
    Payment, Immeuble, Appartement
)

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for SubscriptionPlan model
    """
    total_subscriptions = serializers.SerializerMethodField()
    active_subscriptions = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id',
            'name',
            'description',
            'price',
            'duration_days',
            'max_buildings',
            'max_apartments',
            'is_active',
            'created_at',
            'total_subscriptions',
            'active_subscriptions'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_total_subscriptions(self, obj):
        return obj.subscriptions.count()
    
    def get_active_subscriptions(self, obj):
        return obj.subscriptions.filter(status='ACTIVE').count()


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Subscription model
    """
    syndic_email = serializers.EmailField(source='syndic_profile.user.email', read_only=True)
    syndic_name = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='syndic_profile.company_name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_price = serializers.DecimalField(
        source='plan.price', 
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    days_remaining = serializers.ReadOnlyField()
    is_active_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id',
            'syndic_profile',
            'syndic_email',
            'syndic_name',
            'company_name',
            'plan',
            'plan_name',
            'plan_price',
            'start_date',
            'end_date',
            'status',
            'auto_renew',
            'days_remaining',
            'is_active_status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_syndic_name(self, obj):
        user = obj.syndic_profile.user
        return f"{user.first_name} {user.last_name}".strip() or user.email
    
    def get_is_active_status(self, obj):
        return obj.is_active


class SubscriptionDetailSerializer(SubscriptionSerializer):
    """
    Detailed serializer for Subscription with payment information
    """
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    total_payments = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    pending_payments = serializers.SerializerMethodField()
    
    class Meta(SubscriptionSerializer.Meta):
        fields = SubscriptionSerializer.Meta.fields + [
            'plan_details',
            'total_payments',
            'total_paid',
            'pending_payments'
        ]
    
    def get_total_payments(self, obj):
        return obj.payments.count()
    
    def get_total_paid(self, obj):
        from django.db.models import Sum
        return obj.payments.filter(status='COMPLETED').aggregate(
            total=Sum('amount')
        )['total'] or 0
    
    def get_pending_payments(self, obj):
        return obj.payments.filter(status='PENDING').count()


# ============================================
# PAYMENT SERIALIZERS
# ============================================

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model
    """
    syndic_email = serializers.EmailField(
        source='subscription.syndic_profile.user.email', 
        read_only=True
    )
    syndic_name = serializers.SerializerMethodField()
    company_name = serializers.CharField(
        source='subscription.syndic_profile.company_name', 
        read_only=True
    )
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    processed_by_email = serializers.EmailField(source='processed_by.email', read_only=True)
    processed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'subscription',
            'syndic_email',
            'syndic_name',
            'company_name',
            'plan_name',
            'amount',
            'payment_method',
            'payment_date',
            'status',
            'reference',
            'notes',
            'processed_by',
            'processed_by_email',
            'processed_by_name'
        ]
        read_only_fields = ['id', 'payment_date', 'processed_by']
    
    def get_syndic_name(self, obj):
        user = obj.subscription.syndic_profile.user
        return f"{user.first_name} {user.last_name}".strip() or user.email
    
    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return f"{obj.processed_by.first_name} {obj.processed_by.last_name}".strip() or obj.processed_by.email
        return None


class PaymentDetailSerializer(PaymentSerializer):
    """
    Detailed serializer for Payment with subscription information
    """
    subscription_details = SubscriptionSerializer(source='subscription', read_only=True)
    
    class Meta(PaymentSerializer.Meta):
        fields = PaymentSerializer.Meta.fields + ['subscription_details']