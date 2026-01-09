from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from datetime import timedelta

class UserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model supporting three roles: Admin, Syndic, and Resident
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('SYNDIC', 'Syndic'),
        ('RESIDENT', 'Resident'),
    ]
    
    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def is_admin(self):
        return self.role == 'ADMIN'
    
    @property
    def is_syndic(self):
        return self.role == 'SYNDIC'
    
    @property
    def is_resident(self):
        return self.role == 'RESIDENT'
    
    @property
    def can_manage_system(self):
        """Check if user is admin with system management rights"""
        return self.is_admin
    
    @property
    def has_valid_subscription(self):
        """Check if Syndic has an active subscription"""
        if not self.is_syndic:
            return False
        try:
            subscription = self.syndic_profile.subscription
            return subscription and subscription.is_active
        except:
            return False


class SyndicProfile(models.Model):
    """
    Extended profile for Syndic users - Created by Admin
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='syndic_profile',
        limit_choices_to={'role': 'SYNDIC'}
    )
    
    rib = models.CharField(
        max_length=34,
        blank=True,
        null=True,
        help_text="RIB (Bank Identifier) for bank transfers"
    )
    
    class Meta:
        verbose_name = 'Syndic Profile'
        verbose_name_plural = 'Syndic Profiles'
    
    def __str__(self):
        return f"Syndic: {self.user.email}"


class SubscriptionPlan(models.Model):
    """
    Subscription plans for Syndics - Managed by Admin
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField(help_text="Duration in days (30, 90, 365)")
    max_buildings = models.IntegerField(help_text="Maximum number of buildings")
    max_apartments = models.IntegerField(help_text="Maximum number of apartments")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'
    
    def __str__(self):
        return f"{self.name} - {self.price} DH"


class Subscription(models.Model):
    """
    Syndic subscriptions - Managed by Admin
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('SUSPENDED', 'Suspended'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    syndic_profile = models.OneToOneField(
        SyndicProfile,
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
    
    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
    
    def __str__(self):
        return f"{self.syndic_profile.user.email} - {self.plan.name} ({self.status})"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        today = timezone.now().date()
        return (
            self.status == 'ACTIVE' and
            self.start_date <= today <= self.end_date
        )
    
    @property
    def days_remaining(self):
        """Calculate remaining days"""
        if not self.is_active:
            return 0
        today = timezone.now().date()
        return (self.end_date - today).days


class Payment(models.Model):
    """
    Payment records for Syndic subscriptions - Managed by Admin
    """
    PAYMENT_METHOD_CHOICES = [
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='BANK_TRANSFER')
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    rib = models.CharField(max_length=34, blank=True, null=True, help_text="RIB for bank transfers")
    payment_proof = models.FileField(
        upload_to='',
        blank=True,
        null=True,
        help_text="Upload payment proof (receipt, screenshot, etc.)"
    )
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'role': 'ADMIN'},
        related_name='processed_payments'
    )
    
    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment {self.amount} DH - {self.subscription.syndic_profile.user.email}"


class ResidentProfile(models.Model):
    """
    Extended profile for Resident users - Created by Syndic
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='resident_profile',
        limit_choices_to={'role': 'RESIDENT'}
    )
    cin = models.CharField(max_length=20, blank=True, help_text="National ID Card")
    
    class Meta:
        verbose_name = 'Resident Profile'
        verbose_name_plural = 'Resident Profiles'
    
    def __str__(self):
        return f"Resident: {self.user.email}"


class Immeuble(models.Model):
    """
    Building managed by a Syndic
    """
    syndic = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='immeubles',
        limit_choices_to={'role': 'SYNDIC'}
    )
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    floors = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Immeuble'
        verbose_name_plural = 'Immeubles'
    
    def __str__(self):
        return f"{self.name} - {self.address}"


class Appartement(models.Model):
    """
    Apartment within a building - Managed by Syndic
    """
    immeuble = models.ForeignKey(
        Immeuble, 
        on_delete=models.CASCADE, 
        related_name='appartements'
    )
    resident = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='appartements',
        limit_choices_to={'role': 'RESIDENT'}
    )
    number = models.CharField(max_length=50)
    floor = models.IntegerField()
    monthly_charge = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Default monthly charge amount"
    )
    
    class Meta:
        verbose_name = 'Appartement'
        verbose_name_plural = 'Appartements'
        unique_together = ['immeuble', 'number']
    
    def __str__(self):
        return f"Apt {self.number} - {self.immeuble.name}"


class Reclamation(models.Model):
    """
    Complaint/Request submitted by residents to their Syndic
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    resident = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reclamations',
        limit_choices_to={'role': 'RESIDENT'}
    )
    syndic = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='received_reclamations',
        limit_choices_to={'role': 'SYNDIC'}
    )
    appartement = models.ForeignKey(
        Appartement,
        on_delete=models.CASCADE,
        related_name='reclamations'
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    response = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Reclamation'
        verbose_name_plural = 'Reclamations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.resident.email} ({self.status})"

class ReclamationStatusHistory(models.Model):
    reclamation = models.ForeignKey(
        Reclamation,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    comment = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['changed_at']


class Reunion(models.Model):
    """
    Meeting organized by Syndic for residents of a building
    """
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    syndic = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reunions',
        limit_choices_to={'role': 'SYNDIC'}
    )
    immeuble = models.ForeignKey(
        Immeuble,
        on_delete=models.CASCADE,
        related_name='reunions'
    )
    title = models.CharField(max_length=300)
    topic = models.TextField()
    date_time = models.DateTimeField()
    location = models.CharField(max_length=300, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Reunion'
        verbose_name_plural = 'Reunions'
        ordering = ['-date_time']
    
    def __str__(self):
        return f"{self.title} - {self.date_time.strftime('%Y-%m-%d %H:%M')}"


class Charge(models.Model):
    """
    Monthly charges/fees for apartments - Created by Syndic
    """
    STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('PARTIALLY_PAID', 'Partially Paid'),
    ]
    
    appartement = models.ForeignKey(
        Appartement, 
        on_delete=models.CASCADE, 
        related_name='charges'
    )
    description = models.CharField(max_length=300)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UNPAID')
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Charge'
        verbose_name_plural = 'Charges'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.description} - {self.amount} DH ({self.status})"
    
    @property
    def is_overdue(self):
        """Check if charge is overdue"""
        today = timezone.now().date()
        return self.status == 'UNPAID' and self.due_date < today


from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ResidentPayment(models.Model):
    PAYMENT_METHODS = [
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]

    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('REJECTED', 'Rejected'),
    ]

    resident = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        limit_choices_to={'role': 'RESIDENT'}
    )

    syndic = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='validated_payments',
        limit_choices_to={'role': 'SYNDIC'}
    )

    appartement = models.ForeignKey(
        'Appartement',
        on_delete=models.CASCADE,
        related_name='payments'
    )

    charge = models.ForeignKey(
        'Charge',
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='PENDING'
    )

    reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Bank reference / receipt number"
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Date the resident claims payment was made"
    )

    notes = models.TextField(
        blank=True,
        default='',
        help_text="Additional notes about payment"
    )

    rib = models.CharField(
        max_length=34,
        blank=True,
        null=True,
        help_text="RIB for bank transfers"
    )

    payment_proof = models.FileField(
        upload_to='resident_payment_proofs/',
        blank=True,
        null=True,
        help_text="Upload payment proof (receipt, screenshot, etc.)"
    )

    confirmed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Date syndic confirmed payment"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resident Payment'
        verbose_name_plural = 'Resident Payments'

    def __str__(self):
        return f"{self.resident.email} - {self.amount} ({self.status})"
