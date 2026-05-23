from rest_framework import serializers
from .models import Servicio, Convenio, Requisito

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = '__all__'

    def validate_nombre(self, value):
        value = value.strip().title()
        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 2 caracteres."
            )
        return value

class RequisitoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    
    class Meta:
        model = Requisito
        fields = ['id', 'nombre', 'descripcion', 'created_at']

class ConvenioSerializer(serializers.ModelSerializer):
    servicios_details = ServicioSerializer(source='servicios', many=True, read_only=True)
    servicios = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Servicio.objects.all(),
        write_only=True,
        required=False
    )
    requisitos_details = RequisitoSerializer(source='requisitos', many=True, read_only=True)
    requisitos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Requisito.objects.all(),
        required=False
    )

    class Meta:
        model = Convenio
        fields = ['id', 'nombre', 'tipo', 'servicios', 'servicios_details', 'requisitos', 'requisitos_details', 'descripcion', 'activo', 'created_at', 'updated_at']

    def validate_nombre(self, value):
        value = value.strip().title()
        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 2 caracteres."
            )
        return value

    def create(self, validated_data):
        servicios = validated_data.pop('servicios', [])
        requisitos = validated_data.pop('requisitos', [])
        
        convenio = Convenio.objects.create(**validated_data)
        convenio.servicios.set(servicios)
        convenio.requisitos.set(requisitos)
            
        return convenio

    def update(self, instance, validated_data):
        servicios = validated_data.pop('servicios', None)
        requisitos = validated_data.pop('requisitos', None)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update many-to-many services if provided
        if servicios is not None:
            instance.servicios.set(servicios)
        
        # Update many-to-many requisitos if provided
        if requisitos is not None:
            instance.requisitos.set(requisitos)
                    
        return instance
