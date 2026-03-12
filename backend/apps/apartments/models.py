from django.db import models
from django.conf import settings

class Appartement(models.Model):
    """
    Apartment within a building - Managed by Syndic
    """
    immeuble = models.ForeignKey(
        'buildings.Immeuble', 
        on_delete=models.CASCADE, 
        related_name='appartements'
    )
    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
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
        db_table = 'myapp_appartement'
        verbose_name = 'Appartement'
        verbose_name_plural = 'Appartements'
        unique_together = ['immeuble', 'number']
    
    def __str__(self):
        return f"Apt {self.number} - {self.immeuble.name}"
