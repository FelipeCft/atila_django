from django.db import models

class Configuracion(models.Model):
    """
    Modelo para almacenar la configuración general del sitio.
    Solo debe existir un registro en esta tabla.
    """
    # Información de Contacto
    telefono = models.CharField(max_length=20, default='+56 9 1234 5678', verbose_name='Teléfono Móvil')
    telefono_fijo = models.CharField(max_length=20, null=True, blank=True, verbose_name='Teléfono Fijo')
    email = models.EmailField(default='contacto@atilaclinic.cl', verbose_name='Email de Contacto')
    direccion = models.CharField(max_length=255, default='Av. Principal 123, Vitacura, Santiago', verbose_name='Dirección Principal')
    
    # Redes Sociales
    url_facebook = models.URLField(max_length=255, null=True, blank=True, verbose_name='URL Facebook')
    url_instagram = models.URLField(max_length=255, null=True, blank=True, verbose_name='URL Instagram')
    url_whatsapp = models.URLField(max_length=255, null=True, blank=True, verbose_name='URL WhatsApp')

    # Mapa de Google
    google_maps_embed_url = models.TextField(
        default='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.7267890123456!2d-70.5956789!3d-33.3904874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDIzJzI1LjgiUyA3MMKwMzUnNDQuNCJX!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl',
        verbose_name='URL del Mapa de Google',
        help_text='URL del iframe de Google Maps'
    )
    google_maps_link = models.URLField(
        default='https://www.google.com/maps/search/?api=1&query=Av.+Principal+123,+Vitacura,+Santiago',
        verbose_name='Link de Google Maps',
        help_text='URL para abrir en Google Maps'
    )

    # Horarios
    horario_semana = models.CharField(max_length=100, default='Lunes a Viernes: 8:00 - 20:00', verbose_name='Horario Semana')
    horario_sabado = models.CharField(max_length=100, default='Sábados: 9:00 - 14:00', verbose_name='Horario Sábado')
    horario_domingo = models.CharField(max_length=100, default='Domingos cerrado', verbose_name='Horario Domingo')

    # Información adicional
    info_estacionamiento = models.CharField(max_length=100, default='Estacionamiento gratuito', verbose_name='Info Estacionamiento')
    info_transporte = models.TextField(
        default='Metro: Línea 1, Estación Vitacura\nBus: Líneas 412, 413, 425',
        verbose_name='Info Transporte Público'
    )

    # Timestamps
    actualizado_en = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')

    class Meta:
        verbose_name = 'Configuración'
        verbose_name_plural = 'Configuración'
        db_table = 'configuracion'

    def __str__(self):
        return f'Configuración del Sitio (Actualizado: {self.actualizado_en.strftime("%d/%m/%Y %H:%M")})'

    def save(self, *args, **kwargs):
        """
        Asegurarse de que solo exista un registro de configuración
        """
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_config(cls):
        """
        Obtener o crear la configuración única
        """
        config, created = cls.objects.get_or_create(pk=1)
        return config
