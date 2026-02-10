from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator

class SubscriptionPlan(models.Model):
    """Subscription plans for Syndics - Managed by Admin"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField(help_text="Duration in days (30, 90, 365)")
    max_buildings = models.IntegerField(help_text="Maximum number of buildings")
    max_apartments = models.IntegerField(help_text="Maximum number of apartments")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.price} MAD"

    class Meta:
        ordering = ['price']


class Subscription(models.Model):
    """Syndic subscriptions - Managed by Admin"""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    ]

    syndic_profile = models.OneToOneField(
        'myapp.SyndicProfile',
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.syndic_profile.user.email} - {self.plan.name}"

    @property
    def is_active(self):
        """Check if subscription is currently active"""
        today = timezone.now().date()
        return self.status == 'ACTIVE' and self.start_date <= today <= self.end_date

    @property
    def days_remaining(self):
        """Calculate remaining days"""
        today = timezone.now().date()
        if today > self.end_date:
            return 0
        return (self.end_date - today).days


class SubscriptionPayment(models.Model):
    """Payment records for Syndic subscriptions - Supports Stripe integration"""
    PAYMENT_METHOD_CHOICES = [
        ('CARD', 'Credit/Debit Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('STRIPE', 'Stripe'),
        ('PAYPAL', 'PayPal'),
    ]
    STATUS_CHOICES = [
        ('REQUIRES_PAYMENT_METHOD', 'Requires Payment Method'),
        ('REQUIRES_CONFIRMATION', 'Requires Confirmation'),
        ('REQUIRES_ACTION', 'Requires Action'),
        ('PROCESSING', 'Processing'),
        ('SUCCEEDED', 'Succeeded'),
        ('FAILED', 'Failed'),
        ('CANCELED', 'Canceled'),
        ('REFUNDED', 'Refunded'),
        ('PARTIALLY_REFUNDED', 'Partially Refunded'),
    ]
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Increased precision for microtransactions
    currency = models.CharField(max_length=3, default='MAD')
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES,
        default='STRIPE'
    )
    status = models.CharField(
        max_length=30, 
        choices=STATUS_CHOICES, 
        default='REQUIRES_PAYMENT_METHOD'
    )
    
    # Stripe-specific fields
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_payment_method_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_invoice_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_receipt_url = models.URLField(blank=True, null=True)
    
    # Payment details
    payment_date = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payments'
    )
    amount_refunded = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )
    
    # Metadata and tracking
    client_ip = models.GenericIPAddressField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_date']),
        ]
    def __str__(self):
        return f"Payment {self.id} - {self.amount} {self.currency} - {self.get_status_display()}"
    @property
    def is_successful(self):
        return self.status == 'SUCCEEDED'
    @property
    def is_refundable(self):
        return self.status == 'SUCCEEDED' and self.amount_refunded < self.amount
    def update_status(self, status, metadata=None):
        """Helper method to update payment status and metadata"""
        self.status = status
        if metadata:
            self.metadata.update(metadata)
        self.save(update_fields=['status', 'metadata', 'updated_at'])
    def create_refund(self, amount=None, reason='', metadata=None):
        """Create a refund for this payment"""
        if not self.is_refundable:
            raise ValueError("This payment cannot be refunded")
            
        refund_amount = amount or (self.amount - self.amount_refunded)
        
        # In a real implementation, this would call Stripe's API
        # For now, we'll just update the model
        self.amount_refunded += refund_amount
        if self.amount_refunded >= self.amount:
            self.status = 'REFUNDED' if self.amount_refunded == self.amount else 'PARTIALLY_REFUNDED'
        
        self.save()
        return self