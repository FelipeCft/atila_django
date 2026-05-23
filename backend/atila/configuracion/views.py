from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Configuracion
from .serializers import ConfiguracionSerializer
from .permissions import IsProfileAdmin

class ConfiguracionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar la configuración del sitio.
    GET: Público (para mostrar info de contacto en la web)
    PUT/PATCH: Solo administradores (Profile ADMIN)
    """
    queryset = Configuracion.objects.all()
    serializer_class = ConfiguracionSerializer

    def get_permissions(self):
        """
        GET es público, pero PUT/PATCH/DELETE requieren admin del Profile
        """
        if self.action in ['list', 'retrieve', 'get_config']:
            return [AllowAny()]
        return [IsProfileAdmin()]

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def get_config(self, request):
        """
        Endpoint personalizado para obtener la configuración actual
        """
        config = Configuracion.get_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def list(self, request):
        """
        Listar configuración (siempre retorna el único registro)
        """
        config = Configuracion.get_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """
        Actualizar configuración
        """
        config = Configuracion.get_config()
        serializer = self.get_serializer(config, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """
        Actualizar parcialmente la configuración
        """
        config = Configuracion.get_config()
        serializer = self.get_serializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
