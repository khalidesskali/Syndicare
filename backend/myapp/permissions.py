from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permission for Admin users only
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsSyndic(permissions.BasePermission):
    """
    Permission for Syndic users only
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_syndic


class IsResident(permissions.BasePermission):
    """
    Permission for Resident users only
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_resident


class IsAdminOrSyndic(permissions.BasePermission):
    """
    Permission for Admin or Syndic users
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.is_admin:
            return True
        
        if request.user.is_syndic:
            return True
        
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners or admins to edit
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        
        # Check if object has 'user' or 'resident' or 'syndic' field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'resident'):
            return obj.resident == request.user
        if hasattr(obj, 'syndic'):
            return obj.syndic == request.user
        
        return False