from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from servicios.models import Servicio, Convenio, Especialidad, Requisito
from servicios.api.serializers import ServicioSerializer, ConvenioSerializer, EspecialidadSerializer, RequisitoSerializer
from servicios.api.permissions import IsAdminOrReadOnly


class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile') and user.profile.role == 'ADMIN':
            return Especialidad.objects.all()
        return Especialidad.objects.filter(activo=True)

    def perform_destroy(self, instance):
        errores = []
        servicios_count = instance.servicios.count()
        if servicios_count > 0:
            errores.append(f"{servicios_count} servicio(s) asociado(s)")
        profesionales_count = instance.profesionales.count()
        if profesionales_count > 0:
            errores.append(f"{profesionales_count} profesional(es) asignado(s)")
        if errores:
            detalle = " y ".join(errores)
            raise serializers.ValidationError(
                {"detail": f"No se puede eliminar porque tiene {detalle}. Desactívela en su lugar."}
            )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.activo = not instance.activo
        instance.save()
        estado = 'activada' if instance.activo else 'desactivada'
        return Response({
            'message': f'Especialidad {estado} exitosamente.',
            'activo': instance.activo,
        })


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['especialidad']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile') and user.profile.role == 'ADMIN':
            return Servicio.objects.all()
        return Servicio.objects.filter(activo=True)

    def perform_destroy(self, instance):
        from agenda.models import Cita
        citas_count = Cita.objects.filter(servicio=instance).count()
        if citas_count > 0:
            raise serializers.ValidationError(
                {"detail": f"No se puede eliminar porque tiene {citas_count} cita(s) asociada(s). Desactívelo en su lugar."}
            )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.activo = not instance.activo
        instance.save()
        estado = 'activado' if instance.activo else 'desactivado'
        return Response({
            'message': f'Servicio {estado} exitosamente.',
            'activo': instance.activo,
        })


class ConvenioViewSet(viewsets.ModelViewSet):
    queryset = Convenio.objects.all()
    serializer_class = ConvenioSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile') and user.profile.role == 'ADMIN':
            return Convenio.objects.all()
        return Convenio.objects.filter(activo=True)

    def perform_destroy(self, instance):
        servicios_count = instance.servicios.count()
        if servicios_count > 0:
            raise serializers.ValidationError(
                {"detail": f"No se puede eliminar porque tiene {servicios_count} servicio(s) vinculado(s). Desactívelo en su lugar."}
            )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.activo = not instance.activo
        instance.save()
        estado = 'activado' if instance.activo else 'desactivado'
        return Response({
            'message': f'Convenio {estado} exitosamente.',
            'activo': instance.activo,
        })


class RequisitoViewSet(viewsets.ModelViewSet):
    queryset = Requisito.objects.all()
    serializer_class = RequisitoSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile') and user.profile.role == 'ADMIN':
            return Requisito.objects.all()
        return Requisito.objects.filter(activo=True)

    def perform_destroy(self, instance):
        convenios_count = instance.convenios.count()
        if convenios_count > 0:
            raise serializers.ValidationError(
                {"detail": f"No se puede eliminar porque está usado en {convenios_count} convenio(s). Desactívelo en su lugar."}
            )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.activo = not instance.activo
        instance.save()
        estado = 'activado' if instance.activo else 'desactivado'
        return Response({
            'message': f'Requisito {estado} exitosamente.',
            'activo': instance.activo,
        })