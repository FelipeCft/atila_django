from rest_framework import serializers
from django.utils import timezone
from ..models import Cita, HorarioDisponible, HorarioGeneral, SolicitudCita
from users.serializers import ProfileSerializer
from servicios.api.serializers import ServicioSerializer


# Transiciones de estado permitidas (sin restricciones - todas las transiciones permitidas)
VALID_STATE_TRANSITIONS = {
    'PENDING': ['CONFIRMED', 'CANCELLED', 'PENDING'],
    'CONFIRMED': ['COMPLETED', 'CANCELLED', 'PENDING', 'CONFIRMED'],
    'CANCELLED': ['CANCELLED'],
    'COMPLETED': ['COMPLETED'],
}


class CitaSerializer(serializers.ModelSerializer):
    cliente_data = ProfileSerializer(source='cliente.profile', read_only=True)
    profesional_data = ProfileSerializer(source='profesional.profile', read_only=True)
    servicio_data = ServicioSerializer(source='servicio', read_only=True)

    class Meta:
        model = Cita
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def to_internal_value(self, data):
        """Validación temprana para dar mejores mensajes de error"""
        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Validar cliente
        cliente_id = data.get('cliente')
        if cliente_id:
            try:
                user = User.objects.get(pk=cliente_id)
                if not hasattr(user, 'profile') or user.profile.role != 'CLIENT':
                    raise serializers.ValidationError({
                        'cliente': f'El usuario seleccionado ({user.username}) no es un cliente. Solo usuarios con rol CLIENT pueden ser seleccionados como clientes.'
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'cliente': f'El cliente con ID {cliente_id} no existe.'
                })

        # Validar profesional
        profesional_id = data.get('profesional')
        if profesional_id:
            try:
                user = User.objects.get(pk=profesional_id)
                if not hasattr(user, 'profile') or user.profile.role != 'STAFF':
                    raise serializers.ValidationError({
                        'profesional': f'El usuario seleccionado ({user.username}) no es un profesional. Solo usuarios con rol STAFF pueden ser seleccionados como profesionales.'
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'profesional': f'El profesional con ID {profesional_id} no existe.'
                })

        return super().to_internal_value(data)

    def validate(self, data):
        instance = self.instance
        inicio = data.get('inicio', getattr(instance, 'inicio', None))
        fin = data.get('fin', getattr(instance, 'fin', None))
        profesional = data.get('profesional', getattr(instance, 'profesional', None))
        cliente = data.get('cliente', getattr(instance, 'cliente', None))
        nuevo_estado = data.get('estado', None)

        if instance and instance.estado in ['COMPLETED', 'CANCELLED']:
            raise serializers.ValidationError("No se puede editar una cita completada o cancelada.")

        # --- Roles validation ---
        if cliente and hasattr(cliente, 'profile') and cliente.profile.role != 'CLIENT':
            raise serializers.ValidationError({'cliente': "El cliente debe tener el rol CLIENT."})
        if profesional and hasattr(profesional, 'profile') and profesional.profile.role != 'STAFF':
            raise serializers.ValidationError({'profesional': "El profesional debe tener el rol STAFF."})

        # --- 8. Transiciones de estado válidas ---
        if instance and nuevo_estado and nuevo_estado != instance.estado:
            allowed = VALID_STATE_TRANSITIONS.get(instance.estado, [])
            if nuevo_estado not in allowed:
                raise serializers.ValidationError({
                    'estado': f"No se puede cambiar de "
                              f"'{instance.get_estado_display()}' a "
                              f"'{dict(Cita.ESTADO_CHOICES).get(nuevo_estado, nuevo_estado)}'."
                })

        # --- 1. inicio < fin ---
        if inicio and fin:
            if inicio >= fin:
                raise serializers.ValidationError({
                    'fin': "La hora de fin debe ser posterior a la hora de inicio."
                })



        # Las validaciones 3-6 solo aplican si tenemos todos los datos de horario
        if inicio and fin and profesional:
            # --- 6. Cita en día activo de la clínica ---
            dia_semana = inicio.weekday()
            try:
                horario_general = HorarioGeneral.objects.get(dia_semana=dia_semana)
                if not horario_general.activo:
                    raise serializers.ValidationError({
                        'inicio': f"La clínica no atiende los "
                                  f"{horario_general.get_dia_semana_display()}."
                    })
            except HorarioGeneral.DoesNotExist:
                raise serializers.ValidationError({
                    'inicio': "No hay horario configurado para ese día."
                })

            # --- 5. Cita dentro del HorarioDisponible del profesional ---
            try:
                horario_prof = HorarioDisponible.objects.get(
                    profesional=profesional,
                    dia_semana=dia_semana
                )
                hora_inicio_cita = inicio.time()
                hora_fin_cita = fin.time()
                if (hora_inicio_cita < horario_prof.hora_inicio or
                        hora_fin_cita > horario_prof.hora_fin):
                    raise serializers.ValidationError({
                        'inicio': f"La cita debe estar dentro del horario del profesional "
                                  f"({horario_prof.hora_inicio.strftime('%H:%M')} - "
                                  f"{horario_prof.hora_fin.strftime('%H:%M')})."
                    })
            except HorarioDisponible.DoesNotExist:
                raise serializers.ValidationError({
                    'profesional': "El profesional no tiene horario disponible para ese día."
                })

            # --- 3. Solapamiento de citas (profesional) ---
            citas_profesional = Cita.objects.filter(
                profesional=profesional,
                inicio__lt=fin,
                fin__gt=inicio,
            ).exclude(estado='CANCELLED')

            if instance:
                citas_profesional = citas_profesional.exclude(pk=instance.pk)

            if citas_profesional.exists():
                raise serializers.ValidationError({
                    'inicio': "El profesional ya tiene una cita agendada en ese horario."
                })

        # --- 4. Solapamiento de citas (cliente) ---
        if inicio and fin and cliente:
            citas_cliente = Cita.objects.filter(
                cliente=cliente,
                inicio__lt=fin,
                fin__gt=inicio,
            ).exclude(estado='CANCELLED')

            if instance:
                citas_cliente = citas_cliente.exclude(pk=instance.pk)

            if citas_cliente.exists():
                raise serializers.ValidationError({
                    'inicio': "El cliente ya tiene una cita agendada en ese horario."
                })

        return data


class HorarioGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioGeneral
        fields = '__all__'

    def validate(self, data):
        hora_inicio = data.get('hora_inicio')
        hora_fin = data.get('hora_fin')

        # --- 10. hora_inicio < hora_fin ---
        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({
                'hora_fin': "La hora de cierre debe ser posterior a la hora de apertura."
            })
        return data


class HorarioDisponibleSerializer(serializers.ModelSerializer):
    profesional_data = ProfileSerializer(source='profesional.profile', read_only=True)

    class Meta:
        model = HorarioDisponible
        fields = '__all__'

    def validate(self, data):
        hora_inicio = data.get('hora_inicio')
        hora_fin = data.get('hora_fin')

        # --- 11. hora_inicio < hora_fin ---
        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({
                'hora_fin': "La hora de fin debe ser posterior a la hora de inicio."
            })

        # Validación existente: verificar contra horario global
        instance = HorarioDisponible(**data)
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return data




class SolicitudCitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudCita
        fields = '__all__'
        read_only_fields = ('creado_en', 'actualizado_en')

