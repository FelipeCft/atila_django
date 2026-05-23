from django.contrib import admin
from .models import Cita, HorarioDisponible, SolicitudCita

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'profesional', 'servicio', 'inicio', 'fin', 'estado')
    list_filter = ('estado', 'profesional', 'inicio')
    search_fields = ('cliente__first_name', 'cliente__last_name', 'profesional__first_name', 'profesional__last_name')

@admin.register(HorarioDisponible)
class HorarioDisponibleAdmin(admin.ModelAdmin):
    list_display = ('profesional', 'dia_semana', 'hora_inicio', 'hora_fin')
    list_filter = ('profesional', 'dia_semana')

@admin.register(SolicitudCita)
class SolicitudCitaAdmin(admin.ModelAdmin):
    list_display = ('paciente_nombre', 'paciente_telefono', 'servicio_solicitado', 'fecha_hora_solicitada', 'estado', 'creado_en')
    list_filter = ('estado', 'creado_en')
    search_fields = ('paciente_nombre', 'paciente_telefono', 'paciente_email')
    readonly_fields = ('creado_en', 'actualizado_en')
    ordering = ('-creado_en',)
