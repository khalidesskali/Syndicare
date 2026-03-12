from rest_framework import status
from .base import BaseAuthTestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterTests(BaseAuthTestCase):
    def test_successful_registration(self):
        """Verify registering a new user returns 201 and tokens"""
        data = {
            'email': 'newuser@test.loc',
            'password': 'NewPassword123!',
            'password2': 'NewPassword123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@test.loc')
        
        # Check if profile was created
        user = User.objects.get(email='newuser@test.loc')
        self.assertEqual(user.role, 'SYNDIC')
        self.assertTrue(hasattr(user, 'syndic_profile'))

    def test_duplicate_email(self):
        """Verify registering with an existing email returns 400"""
        data = {
            'email': self.resident.email,
            'password': 'NewPassword123!',
            'password2': 'NewPassword123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_password_mismatch(self):
        """Verify passwords that don't match are rejected"""
        data = {
            'email': 'mismatch@test.loc',
            'password': 'NewPassword123!',
            'password2': 'DifferentPassword123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data['errors'])

    def test_missing_fields(self):
        """Verify missing required fields returns 400"""
        data = {
            'email': 'missing@test.loc',
            'password': 'NewPassword123!',
            # first_name/last_name omitted
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
