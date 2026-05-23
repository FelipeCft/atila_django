import logging
from rest_framework import generics, status

logger = logging.getLogger(__name__)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Profile
from .serializers import (
    ProfileSerializer, 
    PublicRegisterSerializer, 
    AdminRegisterSerializer, 
    LoginSerializer
)


# ==================== EXISTING VIEWS ====================


from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model

# ==================== EXISTING VIEWS ====================

class UserList(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo admins pueden ver la lista completa
        try:
            if self.request.user.profile.role == Profile.Role.ADMIN:
                return Profile.objects.all().order_by('user__first_name', 'user__last_name')
        except:
            pass
        return Profile.objects.none()

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
         # Solo admins pueden modificar cualquier usuario
        try:
            if self.request.user.profile.role == Profile.Role.ADMIN:
                return Profile.objects.all()
        except:
            pass
        return Profile.objects.none()

    def destroy(self, request, *args, **kwargs):
        profile = self.get_object()
        user = profile.user

        errores = []

        # Verificar si tiene citas asociadas
        citas_cliente_count = user.citas_as_cliente.count()
        if citas_cliente_count > 0:
            errores.append(f"{citas_cliente_count} cita(s) como paciente")
            
        citas_profesional_count = user.citas_as_profesional.count()
        if citas_profesional_count > 0:
            errores.append(f"{citas_profesional_count} cita(s) como profesional")

        # Verificar si tiene movimientos en inventario
        if hasattr(user, 'movimiento_set'):
            movimientos_count = user.movimiento_set.count()
            if movimientos_count > 0:
                errores.append(f"{movimientos_count} movimiento(s) de inventario")

        if errores:
            detalle_errores = " y ".join(errores)
            return Response(
                {
                    "detail": f"No se puede eliminar la cuenta permanentemente porque tiene registros asociados: {detalle_errores}. Por favor, desactiva la cuenta en su lugar."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Si no tiene incidencias críticas, eliminar el usuario base (elimina el perfil en cascada)
        user.delete()
        return Response({"detail": "Usuario eliminado permanentemente con éxito."}, status=status.HTTP_204_NO_CONTENT)


# ==================== AUTHENTICATION VIEWS ====================

class PublicRegisterView(APIView):
    """
    Vista para registro público de usuarios.
    Cualquier persona puede registrarse, pero solo se crean usuarios con rol CLIENT.
    Envía un correo de verificación.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PublicRegisterSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            user = profile.user
            
            # Desactivar usuario hasta que verifique correo
            user.is_active = False 
            user.save()

            # Generar token y uid
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Construir URL de verificación (Frontend URL)
            verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"

            # Enviar correo
            subject = 'Verifica tu correo electrónico - Atila'
            message = f'Hola {profile.full_name},\n\nPor favor verifica tu correo haciendo click en el siguiente enlace:\n{verify_url}\n\nSi no te registraste, ignora este correo.'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]

            try:
                send_mail(subject, message, from_email, recipient_list)
            except Exception as e:
                # En caso de error al enviar correo, quizás borrar usuario o loguear error
                logger.error(f"Error enviando correo de verificación: {e}", exc_info=True)
                return Response({'error': 'Error enviando correo de verificación. Intente nuevamente.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                'message': 'Usuario registrado exitosamente. Por favor revisa tu correo para verificar tu cuenta.',
                'user': {
                    'id': profile.user.id,
                    'username': profile.user.username,
                    'email': profile.user.email,
                    'full_name': profile.full_name,
                    'position': profile.position,
                    'role': profile.role,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    """
    Vista para verificar el correo electrónico mediante el link enviado.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')

        if not uidb64 or not token:
            return Response({'error': 'Faltan parámetros de verificación'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            User = get_user_model()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            
            # Marcar perfil como verificado
            profile = user.profile
            profile.is_verified = True
            profile.save()

            return Response({'message': 'Correo verificado exitosamente. Ya puedes iniciar sesión.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'El enlace de verificación es inválido o ha expirado.'}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.authtoken.models import Token
from django.contrib.auth import login # Ya no es estrictamente necesario con TokenAuth pero no hace daño
# from django.utils.decorators import method_decorator # Quitamos estos
# from django.views.decorators.csrf import ensure_csrf_cookie # Quitamos estos

class AdminRegisterView(APIView):
    """
    Vista para que administradores creen usuarios con cualquier rol.
    Requiere que el usuario autenticado tenga rol ADMIN.
    """
    permission_classes = [IsAuthenticated] # Restaurar seguridad

    def post(self, request):
        # Verificar que el usuario autenticado sea ADMIN
        try:
            if request.user.profile.role != Profile.Role.ADMIN:
                return Response({
                    'error': 'No tienes permisos para crear usuarios. Solo administradores.'
                }, status=status.HTTP_403_FORBIDDEN)
        except Profile.DoesNotExist:
             return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        except AttributeError:
             return Response({'error': 'No autenticado'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response({
                'message': 'Usuario creado exitosamente',
                'user': {
                    'id': profile.user.id,
                    'username': profile.user.username,
                    'email': profile.user.email,
                    'full_name': profile.full_name,
                    'position': profile.position,
                    'role': profile.role,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Vista para login que acepta username O email.
    Retorna un Token de autenticación.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            user = user_data['user']
            
            if not user.is_active:
                 return Response({'error': 'Esta cuenta está inactiva o no ha sido verificada.'}, status=status.HTTP_400_BAD_REQUEST)

            # Generar o recuperar token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': 'Login exitoso',
                'token': token.key, # Retornar el token al frontend
                'user': serializer.to_representation(user_data)
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ToggleUserActiveView(APIView):
    """
    Vista para activar/desactivar un usuario.
    Solo accesible por administradores. Al desactivar, invalida el token del usuario.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Verificar que el solicitante sea ADMIN
        try:
            if request.user.profile.role != Profile.Role.ADMIN:
                return Response(
                    {'error': 'Solo administradores pueden activar/desactivar usuarios.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Profile.DoesNotExist:
            return Response({'error': 'Perfil no encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener el usuario objetivo
        User = get_user_model()
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Impedir que un admin se desactive a sí mismo
        if target_user == request.user:
            return Response(
                {'error': 'No puedes desactivar tu propia cuenta.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Toggle is_active
        target_user.is_active = not target_user.is_active
        target_user.save()

        # Si se desactivó, eliminar su token para cortar acceso inmediato
        if not target_user.is_active:
            Token.objects.filter(user=target_user).delete()

        estado = 'activado' if target_user.is_active else 'desactivado'
        return Response({
            'message': f'Usuario {estado} exitosamente.',
            'is_active': target_user.is_active,
        }, status=status.HTTP_200_OK)
