"""
Script de inicialización para crear el superusuario automáticamente
si no existen usuarios en la base de datos.
"""
import os
import threading
from django.contrib.auth import get_user_model
from django.db import connection


# Variable global para evitar ejecuciones múltiples
_lock = threading.Lock()
_execution_started = False


def create_initial_superuser():
    """
    Crea el superusuario inicial si no hay usuarios en la base de datos.
    Utiliza las variables de entorno definidas en .env

    Se ejecuta en un thread separado para evitar warnings de Django
    sobre acceso a BD durante la inicialización.
    """
    global _execution_started

    # Evitar múltiples ejecuciones
    with _lock:
        if _execution_started:
            return
        _execution_started = True

    def _create_superuser():
        try:
            # Verificar que las tablas existan (evitar errores en migraciones)
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_schema = 'public'
                        AND table_name = 'auth_user'
                    );
                """)
                table_exists = cursor.fetchone()[0]

            if not table_exists:
                print("[STARTUP] Tablas de base de datos aun no creadas. Omitiendo creacion de superusuario.")
                return

            User = get_user_model()

            # Verificar si ya existen usuarios
            if User.objects.exists():
                print(f"[STARTUP] Base de datos ya tiene {User.objects.count()} usuario(s). Omitiendo creacion de superusuario.")
                return

            # Obtener credenciales desde variables de entorno
            username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
            email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@atila.com')
            password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin')

            try:
                # Crear el superusuario
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )

                # Actualizar el perfil a ADMIN (si existe el modelo Profile)
                if hasattr(user, 'profile'):
                    user.profile.role = 'ADMIN'
                    user.profile.save()

                print("[STARTUP] No se detectaron usuarios en la base de datos")
                print("[STARTUP] Usuario inicial creado exitosamente desde variables de entorno")

            except Exception as create_error:
                # Si el usuario ya existe (por ejecución múltiple de ready()), ignorar silenciosamente
                if 'already exists' in str(create_error).lower() or 'duplicate' in str(create_error).lower() or 'duplicada' in str(create_error).lower():
                    pass  # Usuario ya fue creado en otra llamada a ready(), esto es normal
                else:
                    # Si es otro tipo de error, mostrarlo
                    print(f"[STARTUP] Error al crear superusuario: {create_error}")

        except Exception as e:
            # Error general (ej: tablas no existen, problemas de BD, etc.)
            pass  # Ignorar silenciosamente para no ensuciar los logs

    # Ejecutar en un thread separado para evitar warnings de Django
    thread = threading.Thread(target=_create_superuser)
    thread.daemon = True
    thread.start()
