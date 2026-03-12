from rest_framework import status
from .base import BaseAuthTestCase

class ProfileTests(BaseAuthTestCase):
    def test_get_user_profile(self):
        """Verify UserProfileView returns correct data"""
        tokens = self.get_tokens(self.syndic.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.syndic.email)

    def test_resident_profile_access_success(self):
        """Verify Resident can access their specific profile view"""
        tokens = self.get_tokens(self.resident.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        response = self.client.get('/api/resident/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_resident_profile_access_denied_for_syndic(self):
        """Verify Syndic cannot access Resident specific profile view"""
        tokens = self.get_tokens(self.syndic.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        response = self.client.get('/api/resident/profile/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resident_profile_update(self):
        """Verify Resident can update their own profile"""
        tokens = self.get_tokens(self.resident.email, self.password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        data = {'first_name': 'UpdatedName'}
        response = self.client.patch('/api/resident/profile/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['first_name'], 'UpdatedName')

    def test_unauthenticated_profile_access(self):
        """Verify 401 for anonymous access"""
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
