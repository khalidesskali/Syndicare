from rest_framework import status
from .base import BaseAuthTestCase

class LoginTests(BaseAuthTestCase):
    def test_successful_login(self):
        """Verify valid credentials return tokens and user data"""
        response = self.client.post('/api/auth/login/', {
            'email': self.syndic.email,
            'password': self.password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], self.syndic.email)

    def test_invalid_credentials(self):
        """Verify incorrect password returns 401"""
        response = self.client.post('/api/auth/login/', {
            'email': self.syndic.email,
            'password': 'WrongPassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_nonexistent_user(self):
        """Verify login with unregistered email returns 401"""
        response = self.client.post('/api/auth/login/', {
            'email': 'nonexistent@test.loc',
            'password': self.password
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_user(self):
        """Verify login with is_active=False is rejected"""
        self.resident.is_active = False
        self.resident.save()
        
        response = self.client.post('/api/auth/login/', {
            'email': self.resident.email,
            'password': self.password
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_missing_fields(self):
        """Verify missing email/password returns 401 due to view implementation"""
        response = self.client.post('/api/auth/login/', {
            'email': self.syndic.email
            # password omitted
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
