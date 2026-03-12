from django.db import models
from django.conf import settings
from django.utils import timezone

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
        'apartments.Appartement', 
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
        db_table = 'myapp_charge'
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


class ChargePayment(models.Model):
    PAYMENT_METHODS = [
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('PAYPAL', 'Paypal')
    ]

    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('REJECTED', 'Rejected'),
    ]

    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='charge_payments',
        limit_choices_to={'role': 'RESIDENT'}
    )

    syndic = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='validated_payments',
        limit_choices_to={'role': 'SYNDIC'}
    )

    appartement = models.ForeignKey(
        'apartments.Appartement',
        on_delete=models.CASCADE,
        related_name='payments'
    )

    charge = models.ForeignKey(
        'payments.Charge',
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

    confirmed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Date syndic confirmed payment"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'myapp_chargepayment'
        ordering = ['-created_at']
        verbose_name = 'Charge Payment'
        verbose_name_plural = 'Charge Payments'

    def __str__(self):
        return f"{self.resident.email} - {self.amount} ({self.status})"
