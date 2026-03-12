from django.db import models
from django.conf import settings

class Immeuble(models.Model):
    """
    Building managed by a Syndic
    """
    syndic = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='immeubles',
        limit_choices_to={'role': 'SYNDIC'}
    )
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    floors = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'myapp_immeuble'
        verbose_name = 'Immeuble'
        verbose_name_plural = 'Immeubles'
    
    def __str__(self):
        return f"{self.name} - {self.address}"
