from rest_framework.permissions import BasePermission

class IsProfileAdmin(BasePermission):
    """
    Permite el acceso solo si el usuario está autenticado y 
    su perfil personalizado tiene el rol 'ADMIN'.
    NO toma en cuenta is_staff o is_superuser de Django.
    """
    def has_permission(self, request, view):
        # Verifica que exista el usuario, esté autenticado y tenga perfil
        if bool(request.user and request.user.is_authenticated):
            # Comprueba estricta y únicamente si el rol en el Profile es ADMIN
            if hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN':
                return True
                
        return False
