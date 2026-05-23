from django.contrib import admin
from .models import Configuracion

@admin.register(Configuracion)
class ConfiguracionAdmin(admin.ModelAdmin):
    list_display = ['telefono', 'email', 'direccion', 'actualizado_en']
    fieldsets = (
        ('Información de Contacto', {
            'fields': ('telefono', 'telefono_fijo', 'email', 'direccion')
        }),
        ('Redes Sociales', {
            'fields': ('url_facebook', 'url_instagram', 'url_whatsapp')
        }),
        ('Google Maps', {
            'fields': ('google_maps_embed_url', 'google_maps_link')
        }),
        ('Horarios', {
            'fields': ('horario_semana', 'horario_sabado', 'horario_domingo')
        }),
        ('Información Adicional', {
            'fields': ('info_estacionamiento', 'info_transporte')
        }),
    )

    def has_add_permission(self, request):
        # Solo permitir un registro
        return not Configuracion.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # No permitir eliminar la configuración
        return False
