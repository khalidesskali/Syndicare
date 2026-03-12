from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

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
    created_by_syndic = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_residents',
        limit_choices_to={'role': 'SYNDIC'}
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        db_table = 'myapp_user'
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


class SyndicProfile(models.Model):
    """
    Extended profile for Syndic users - Created by Admin
    """
    user = models.OneToOneField(
        'users.User', 
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
        db_table = 'myapp_syndicprofile'
        verbose_name = 'Syndic Profile'
        verbose_name_plural = 'Syndic Profiles'
    
    def __str__(self):
        return f"Syndic: {self.user.email}"


class ResidentProfile(models.Model):
    """
    Extended profile for Resident users - Created by Syndic
    """
    user = models.OneToOneField(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='resident_profile',
        limit_choices_to={'role': 'RESIDENT'}
    )
    
    class Meta:
        db_table = 'myapp_residentprofile'
        verbose_name = 'Resident Profile'
        verbose_name_plural = 'Resident Profiles'
    
    def __str__(self):
        return f"Resident: {self.user.email}"


class Notification(models.Model):
    """
    Notifications bridging Syndic and Residents
    """
    NOTIFICATION_TYPES = [
        ('RECLAMATION_CREATED', 'Reclamation Created'),
        ('RECLAMATION_UPDATED', 'Reclamation Updated'),
        ('CHARGE_CREATED', 'Charge Created'),
        ('PAYMENT_CONFIRMED', 'Payment Confirmed'),
        ('REUNION_SCHEDULED', 'Reunion Scheduled'),
        ('SYSTEM', 'System Notification'),
    ]

    recipient = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    read = models.BooleanField(default=False)
    
    # Store ID of related entity (e.g., complaint id, charge id)
    related_entity_id = models.IntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'myapp_notification'
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"[{self.type}] {self.title} to {self.recipient.email}"
