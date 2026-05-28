from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Tiempo de expiración del token (configurable en settings.py)
TOKEN_EXPIRATION_MINUTES = getattr(settings, 'TOKEN_EXPIRATION_MINUTES', 30)


class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Autenticación por token con expiración automática.

    Por defecto los tokens expiran a los 30 minutos de su creación.
    Este valor puede configurarse en settings.py con TOKEN_EXPIRATION_MINUTES.

    Cuando el token expira:
    - Se elimina de la base de datos.
    - Se retorna un error 401 para que el frontend cierre la sesión.
    """

    def authenticate_credentials(self, key):
        # Reutilizar la lógica base de DRF
        model = self.get_model()
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            raise AuthenticationFailed('Token inválido o inexistente.')

        if not token.user.is_active:
            raise AuthenticationFailed('El usuario está inactivo o deshabilitado.')

        # Verificar si el token ha expirado
        expiration_time = timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
        token_age = timezone.now() - token.created

        if token_age >= expiration_time:
            # Eliminar el token expirado de la base de datos
            token.delete()
            raise AuthenticationFailed(
                'El token ha expirado. Por favor inicia sesión nuevamente.',
                code='token_expired'
            )

        return (token.user, token)
