from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows access to everyone for safe methods (GET).
    Restricts write actions to Admin users only.
    """

    def has_permission(self, request, view):
        # Allow read-only methods for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write methods, check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if user is superuser or has ADMIN role
        if request.user.is_superuser:
            return True
            
        try:
            return request.user.profile.role == 'ADMIN'
        except AttributeError:
            return False
