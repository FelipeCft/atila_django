from rest_framework import serializers
from django.db import transaction
from .models import Insumo, Movimiento, DetalleMovimiento


class InsumoSerializer(serializers.ModelSerializer):
    alerta_stock = serializers.ReadOnlyField()

    class Meta:
        model = Insumo
        fields = '__all__'

    def validate_nombre(self, value):
        value = value.strip().title()
        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 2 caracteres."
            )
        return value


class DetalleMovimientoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.ReadOnlyField(source='insumo.nombre')

    class Meta:
        model = DetalleMovimiento
        fields = ['id', 'insumo', 'insumo_nombre', 'cantidad']


class MovimientoSerializer(serializers.ModelSerializer):
    detalles = DetalleMovimientoSerializer(many=True)
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Movimiento
        fields = ['id', 'tipo', 'created_at', 'observacion', 'usuario', 'usuario_nombre', 'detalles']
        read_only_fields = ['usuario']

    def get_usuario_nombre(self, obj):
        if not obj.usuario:
            return "Usuario Eliminado"

        try:
            if obj.usuario.profile and obj.usuario.profile.full_name:
                return obj.usuario.profile.full_name
        except AttributeError:
            pass

        full_name = obj.usuario.get_full_name()
        if full_name:
            return full_name

        return obj.usuario.username

    def validate_detalles(self, value):
        if not value:
            raise serializers.ValidationError(
                "Debe incluir al menos un detalle."
            )
        return value

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')

        with transaction.atomic():
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                validated_data['usuario'] = request.user

            movimiento = Movimiento.objects.create(**validated_data)

            for detalle_data in detalles_data:
                insumo = detalle_data['insumo']
                cantidad = detalle_data['cantidad']

                # Validate insumo is available
                if not insumo.disponible:
                    raise serializers.ValidationError(
                        f"El insumo '{insumo.nombre}' no está disponible."
                    )

                if movimiento.tipo == Movimiento.Tipo.CONSUMO:
                    if insumo.cantidad < cantidad:
                        raise serializers.ValidationError(
                            f"No hay suficiente stock para {insumo.nombre}. "
                            f"Disponible: {insumo.cantidad}, Solicitado: {cantidad}"
                        )
                    insumo.cantidad -= cantidad
                else:
                    insumo.cantidad += cantidad

                insumo.save()
                DetalleMovimiento.objects.create(movimiento=movimiento, **detalle_data)

        return movimiento
