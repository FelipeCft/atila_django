from django.db import models
from django.conf import settings

# Create your models here.

class Especialidad(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    profesionales = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='especialidades', blank=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

class Servicio(models.Model):
    especialidad = models.ForeignKey(Especialidad, on_delete=models.SET_NULL, null=True, blank=True, related_name='servicios')
    nombre = models.CharField(max_length=100, unique=True)
    precio = models.FloatField()
    descripcion = models.TextField()
    duracion = models.PositiveIntegerField(default=30, help_text="Duración estimada en minutos")
    activo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.nombre

class Requisito(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

class Convenio(models.Model):
    TIPO_CHOICES = [
        ('FONASA', 'Fonasa'),
        ('CONVENIO_ATILA', 'Convenios Atila'),
        ('PROMOCION', 'Promociones'),
    ]
    nombre = models.CharField(max_length=100, unique=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='CONVENIO_ATILA')
    servicios = models.ManyToManyField(Servicio, related_name='convenios', blank=True)
    requisitos = models.ManyToManyField(Requisito, related_name='convenios', blank=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"