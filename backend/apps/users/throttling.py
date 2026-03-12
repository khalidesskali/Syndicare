from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle for login attempts to prevent brute force attacks
    """
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """
    Throttle for registration to prevent spam accounts
    """
    scope = 'register'


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Throttle for password reset requests
    """
    rate = '3/hour'


class PasswordChangeRateThrottle(UserRateThrottle):
    """
    Throttle for password change attempts
    """
    rate = '5/hour'