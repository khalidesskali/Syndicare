from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment
from myapp.models import SyndicProfile
from datetime import timedelta


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionPlan model"""
    total_subscriptions = serializers.SerializerMethodField()
    active_subscriptions = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
        read_only_fields = ('created_at',)

    def get_total_subscriptions(self, obj):
        return obj.subscriptions.count()

    def get_active_subscriptions(self, obj):
        return obj.subscriptions.filter(status='ACTIVE').count()


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model"""
    syndic_email = serializers.EmailField(source='syndic_profile.user.email', read_only=True)
    syndic_name = serializers.SerializerMethodField()
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
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_syndic_name(self, obj):
        return f"{obj.syndic_profile.user.first_name} {obj.syndic_profile.user.last_name}"

    def get_is_active_status(self, obj):
        return obj.is_active

    def create(self, validated_data):
        # Add default end_date if not provided
        if 'end_date' not in validated_data and 'start_date' in validated_data:
            validated_data['end_date'] = validated_data['start_date'] + timedelta(
                days=validated_data['plan'].duration_days
            )
        return super().create(validated_data)


class SubscriptionDetailSerializer(SubscriptionSerializer):
    """Detailed serializer for Subscription with payment information"""
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    total_payments = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    pending_payments = serializers.SerializerMethodField()

    class Meta(SubscriptionSerializer.Meta):
        fields = SubscriptionSerializer.Meta.fields + [
            'plan_details', 'total_payments', 'total_paid', 'pending_payments'
        ]

    def get_total_payments(self, obj):
        return obj.payments.count()

    def get_total_paid(self, obj):
        return obj.payments.filter(status='COMPLETED').aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    def get_pending_payments(self, obj):
        return obj.payments.filter(status='PENDING').aggregate(
            total=models.Sum('amount')
        )['total'] or 0


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    syndic_email = serializers.EmailField(
        source='subscription.syndic_profile.user.email', 
        read_only=True
    )
    syndic_name = serializers.SerializerMethodField()
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    processed_by_email = serializers.EmailField(source='processed_by.email', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('payment_date', 'processed_by')

    def get_syndic_name(self, obj):
        user = obj.subscription.syndic_profile.user
        return f"{user.first_name} {user.last_name}"

    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return f"{obj.processed_by.first_name} {obj.processed_by.last_name}"
        return None


class PaymentDetailSerializer(PaymentSerializer):
    """Detailed serializer for Payment with subscription information"""
    subscription_details = SubscriptionSerializer(source='subscription', read_only=True)

    class Meta(PaymentSerializer.Meta):
        fields = PaymentSerializer.Meta.fields + ['subscription_details']