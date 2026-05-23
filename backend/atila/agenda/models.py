from django.db import models
from django.contrib.auth import get_user_model
from servicios.models import Servicio

User = get_user_model()


class Cita(models.Model):
    ESTADO_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('CONFIRMED', 'Confirmada'),
        ('CANCELLED', 'Cancelada'),
        ('COMPLETED', 'Completada'),
    ]

    cliente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='citas_as_cliente', limit_choices_to={'profile__role': 'CLIENT'})
    profesional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='citas_as_profesional', limit_choices_to={'profile__role': 'STAFF'})
    servicio = models.ForeignKey(Servicio, on_delete=models.SET_NULL, null=True)
    inicio = models.DateTimeField()
    fin = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDING')
    observaciones = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cita: {self.cliente.profile.full_name} con {self.profesional.profile.full_name} - {self.inicio}"

class HorarioGeneral(models.Model):
    DIA_CHOICES = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    dia_semana = models.IntegerField(choices=DIA_CHOICES, unique=True)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Horario Clínica - {self.get_dia_semana_display()}"

class HorarioDisponible(models.Model):
    DIA_CHOICES = HorarioGeneral.DIA_CHOICES

    profesional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='horarios_disponibles', limit_choices_to={'profile__role': 'STAFF'})
    dia_semana = models.IntegerField(choices=DIA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    
    class Meta:
        unique_together = ('profesional', 'dia_semana')

    def clean(self):
        # Validate against Global Hours
        from django.core.exceptions import ValidationError
        try:
            global_hours = HorarioGeneral.objects.get(dia_semana=self.dia_semana)
            if not global_hours.activo:
                 raise ValidationError(f"La clínica no atiende los {self.get_dia_semana_display()}.")
            
            if self.hora_inicio < global_hours.hora_inicio or self.hora_fin > global_hours.hora_fin:
                raise ValidationError(f"El horario debe estar dentro del horario de la clínica ({global_hours.hora_inicio} - {global_hours.hora_fin}).")
        except HorarioGeneral.DoesNotExist:
             raise ValidationError(f"No hay horario general configurado para los {self.get_dia_semana_display()}.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.profesional.profile.full_name} - {self.get_dia_semana_display()}: {self.hora_inicio} - {self.hora_fin}"

class SolicitudCita(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('CONTACTADO', 'Contactado'),
        ('DESCARTADO', 'Descartado'),
        ('AGENDADO', 'Agendado'),
    ]

    paciente_nombre = models.CharField(max_length=255)
    paciente_telefono = models.CharField(max_length=50)
    paciente_email = models.EmailField(blank=True, null=True)
    servicio_solicitado = models.CharField(max_length=255)
    profesional_solicitado = models.CharField(max_length=255)
    fecha_hora_solicitada = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Solicitud {self.paciente_nombre} - {self.fecha_hora_solicitada} ({self.get_estado_display()})"
