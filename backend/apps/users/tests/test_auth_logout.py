from rest_framework import status
from .base import BaseAuthTestCase

class LogoutTests(BaseAuthTestCase):
    def setUp(self):
        super().setUp()
        # Get tokens for testing
        tokens = self.get_tokens(self.syndic.email, self.password)
        self.access_token = tokens['access']
        self.refresh_token = tokens['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_successful_logout(self):
        """Verify passing a valid refresh token blacklists it"""
        response = self.client.post('/api/auth/logout/', {
            'refresh': self.refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_missing_refresh_token(self):
        """Verify omitting the refresh token returns 400"""
        response = self.client.post('/api/auth/logout/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_refresh_token(self):
        """Verify passing an invalid token returns 400"""
        response = self.client.post('/api/auth/logout/', {
            'refresh': 'invalid.token.here'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_logout(self):
        """Verify unauthenticated requests return 401"""
        self.client.credentials()  # Clear credentials
        response = self.client.post('/api/auth/logout/', {
            'refresh': self.refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
