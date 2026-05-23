from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        import users.signals

        # Crear superusuario inicial si no hay usuarios
        # Solo ejecutar si no estamos haciendo migraciones
        import sys
        if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv:
            from users.startup import create_initial_superuser
            create_initial_superuser()

