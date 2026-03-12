from django.db import models
from django.conf import settings

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
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reunions',
        limit_choices_to={'role': 'SYNDIC'}
    )
    immeuble = models.ForeignKey(
        'buildings.Immeuble',
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
        db_table = 'myapp_reunion'
        verbose_name = 'Reunion'
        verbose_name_plural = 'Reunions'
        ordering = ['-date_time']
    
    def __str__(self):
        return f"{self.title} - {self.date_time.strftime('%Y-%m-%d %H:%M')}"
