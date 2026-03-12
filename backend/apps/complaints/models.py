from django.db import models
from django.conf import settings

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

    CATEGORY_CHOICES = [
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICITY', 'Electricity'),
        ('NOISE', 'Noise'),
        ('SECURITY', 'Security'),
        ('ELEVATOR', 'Elevator'),
        ('CLEANLINESS', 'Cleanliness'),
        ('ADMINISTRATIVE', 'Administrative'),
        ('PARKING', 'Parking'),
        ('OTHER', 'Other'),
    ]

    DEPARTMENT_CHOICES = [
        ('MAINTENANCE', 'Maintenance'),
        ('SECURITY', 'Security'),
        ('ADMINISTRATION', 'Administration'),
        ('FINANCE', 'Finance'),
        ('CLEANING', 'Cleaning'),
        ('MANAGEMENT', 'Management'),
    ]

    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reclamations',
        limit_choices_to={'role': 'RESIDENT'}
    )

    syndic = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reclamations',
        limit_choices_to={'role': 'SYNDIC'}
    )

    appartement = models.ForeignKey(
        'apartments.Appartement',
        on_delete=models.CASCADE,
        related_name='reclamations'
    )

    title = models.CharField(max_length=200)
    content = models.TextField()

    # Business fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')

    # AI Generated Fields
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True, null=True)
    ai_urgency_level = models.CharField(max_length=20, blank=True, null=True)
    priority_score = models.FloatField(blank=True, null=True)
    ai_summary = models.TextField(blank=True, null=True)
    suggested_department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    sentiment = models.CharField(max_length=20, blank=True, null=True)
    confidence_score = models.FloatField(blank=True, null=True)

    # AI Processing State
    ai_processed = models.BooleanField(default=False)
    ai_processed_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    response = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'myapp_reclamation'
        verbose_name = 'Reclamation'
        verbose_name_plural = 'Reclamations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.resident.email} ({self.status})"

class ReclamationStatusHistory(models.Model):
    reclamation = models.ForeignKey(
        'complaints.Reclamation',
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True
    )
    comment = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'myapp_reclamationstatushistory'
        ordering = ['changed_at']
