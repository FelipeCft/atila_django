from rest_framework import serializers
from servicios.models import Servicio, Convenio, Especialidad, Requisito

class EspecialidadSerializer(serializers.ModelSerializer):
    servicios = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Servicio.objects.all(),
        required=False
    )

    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'descripcion', 'profesionales', 'servicios', 'activo', 'created_at', 'updated_at']

    def validate_nombre(self, value):
        value = value.strip().title()
        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 2 caracteres."
            )
        return value

    def create(self, validated_data):
        servicios_data = validated_data.pop('servicios', [])
        especialidad = super().create(validated_data)
        if servicios_data:
            especialidad.servicios.set(servicios_data)
        return especialidad

    def update(self, instance, validated_data):
        servicios_data = validated_data.pop('servicios', None)
        instance = super().update(instance, validated_data)
        if servicios_data is not None:
            instance.servicios.set(servicios_data)
        return instance

class RequisitoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    
    class Meta:
        model = Requisito
        fields = ['id', 'nombre', 'descripcion', 'activo', 'created_at']

    def validate_nombre(self, value):
        value = value.strip().title()
        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 2 caracteres."
            )
        return value

class SimpleConvenioSerializer(serializers.ModelSerializer):
    requisitos = RequisitoSerializer(many=True, read_only=True)

    class Meta:
        model = Convenio
        fields = ['id', 'nombre', 'tipo', 'descripcion', 'requisitos']

class ServicioSerializer(serializers.ModelSerializer):
    especialidad_nombre = serializers.ReadOnlyField(source='especialidad.nombre')
    convenios = SimpleConvenioSerializer(many=True, read_only=True)
    convenio_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Convenio.objects.all(), 
        write_only=True, 
        required=False, 
        source='convenios'
    )
    
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

    def create(self, validated_data):
        convenios_data = validated_data.pop('convenios', [])
        servicio = Servicio.objects.create(**validated_data)
        servicio.convenios.set(convenios_data)
        return servicio

    def update(self, instance, validated_data):
        convenios_data = validated_data.pop('convenios', None)
        instance = super().update(instance, validated_data)
        if convenios_data is not None:
            instance.convenios.set(convenios_data)
        return instance


class ConvenioSerializer(serializers.ModelSerializer):
    servicios_details = ServicioSerializer(source='servicios', many=True, read_only=True)
    servicios = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Servicio.objects.all(),
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
