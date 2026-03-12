from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from ..models import SyndicProfile, ResidentProfile
from django.core.cache import cache

User = get_user_model()

class BaseAuthTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.password = "SecurePassword123!"
        
        # Create Admin
        self.admin = User.objects.create_superuser(
            email="admin@test.loc", 
            password=self.password,
            first_name="Admin",
            last_name="User"
        )
        
        # Create Syndic
        self.syndic = User.objects.create_user(
            email="syndic@test.loc", 
            password=self.password, 
            role="SYNDIC",
            first_name="Syndic",
            last_name="User"
        )
        SyndicProfile.objects.create(user=self.syndic)
        
        # Create Resident
        self.resident = User.objects.create_user(
            email="resident@test.loc", 
            password=self.password, 
            role="RESIDENT",
            first_name="Resident",
            last_name="User"
        )
        ResidentProfile.objects.create(user=self.resident)

    def get_tokens(self, email, password):
        response = self.client.post('/api/auth/login/', {
            'email': email,
            'password': password
        })
        return response.data
