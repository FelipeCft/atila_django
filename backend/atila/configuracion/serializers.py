from rest_framework import serializers
from .models import Configuracion

class ConfiguracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuracion
        fields = [
            'id',
            'telefono',
            'telefono_fijo',
            'email',
            'direccion',
            'url_facebook',
            'url_instagram',
            'url_whatsapp',
            'google_maps_embed_url',
            'google_maps_link',
            'horario_semana',
            'horario_sabado',
            'horario_domingo',
            'info_estacionamiento',
            'info_transporte',
            'actualizado_en'
        ]
        read_only_fields = ['id', 'actualizado_en']
