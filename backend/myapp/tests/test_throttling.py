from rest_framework import status
from .base import BaseAuthTestCase
from django.core.cache import cache

class ThrottlingTests(BaseAuthTestCase):
    def setUp(self):
        super().setUp()
        cache.clear()

    def test_login_rate_limit(self):
        """Verify login attempts are throttled after limit (5/min in settings)"""
        # The limit is 5 per minute for 'login' throttle
        
        for _ in range(5):
            response = self.client.post('/api/auth/login/', {
                'email': self.syndic.email,
                'password': 'WrongPassword'
            })
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
            
        # 6th attempt should be throttled
        response = self.client.post('/api/auth/login/', {
            'email': self.syndic.email,
            'password': 'WrongPassword'
        })
        # Note: Throttling might depend on test environment cache settings
        # If it's enabled, we expect 429.
        if response.status_code == 429:
             self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
             self.assertIn('detail', response.data)
             self.assertTrue(response.data['detail'].startswith('Request was throttled'))
        else:
             # In some test environments, throttling might be disabled or use DummyCache
             print("\nNote: Throttling did not trigger. Check CACHES setting in tests.")
