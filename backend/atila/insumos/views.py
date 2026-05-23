from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsAdminUser
from .models import Insumo, Movimiento, DetalleMovimiento
from .serializers import InsumoSerializer, MovimientoSerializer


class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumo.objects.all().order_by('-created_at')
    serializer_class = InsumoSerializer
    permission_classes = [IsAdminUser]

    def perform_destroy(self, instance):
        movimientos_count = DetalleMovimiento.objects.filter(insumo=instance).count()
        if movimientos_count > 0:
            raise serializers.ValidationError(
                {"detail": f"No se puede eliminar porque tiene {movimientos_count} movimiento(s) de inventario asociado(s). Desactívelo en su lugar."}
            )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.disponible = not instance.disponible
        instance.save()
        estado = 'activado' if instance.disponible else 'desactivado'
        return Response({
            'message': f'Insumo {estado} exitosamente.',
            'disponible': instance.disponible,
        })


class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all().order_by('-created_at')
    serializer_class = MovimientoSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'post', 'head']
