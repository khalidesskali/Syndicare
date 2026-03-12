from rest_framework import status
from .base import BaseAuthTestCase

class PasswordTests(BaseAuthTestCase):
    def test_successful_password_change(self):
        """Verify password change with valid current password"""
        tokens = self.get_tokens(self.syndic.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        new_password = "NewSecurePassword456!"
        data = {
            'old_password': self.password,
            'new_password': new_password,
            'new_password2': new_password
        }
        response = self.client.post('/api/auth/change-password/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify old password no longer works for login
        tokens_fail = self.get_tokens(self.syndic.email, self.password)
        self.assertEqual(tokens_fail.get('status_code', 200), 200) # get_tokens returns data
        # Actually in base.py get_tokens doesn't check status code. 
        # Let's verify via client directly
        response_fail = self.client.post('/api/auth/login/', {
            'email': self.syndic.email,
            'password': self.password
        })
        self.assertEqual(response_fail.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Verify new password works
        response_success = self.client.post('/api/auth/login/', {
            'email': self.syndic.email,
            'password': new_password
        })
        self.assertEqual(response_success.status_code, status.HTTP_200_OK)

    def test_incorrect_old_password(self):
        """Verify change fails with wrong current password"""
        tokens = self.get_tokens(self.syndic.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        data = {
            'old_password': 'WrongPassword123',
            'new_password': 'NewPassword123!',
            'new_password2': 'NewPassword123!'
        }
        response = self.client.post('/api/auth/change-password/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_mismatch(self):
        """Verify change fails if new passwords don't match"""
        tokens = self.get_tokens(self.syndic.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        data = {
            'old_password': self.password,
            'new_password': 'NewPassword123!',
            'new_password2': 'DifferentPassword123!'
        }
        response = self.client.post('/api/auth/change-password/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
