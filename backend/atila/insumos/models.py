from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Insumo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    cantidad = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=5)
    disponible = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Insumo'
        verbose_name_plural = 'Insumos'
        ordering = ['-created_at']

    @property
    def alerta_stock(self):
        if self.cantidad == 0:
            return 'AGOTADO'
        elif self.cantidad <= self.stock_minimo:
            return 'BAJO'
        else:
            return 'ALTO'

    def __str__(self):
        return f"{self.nombre} - {self.alerta_stock}"


class Movimiento(models.Model):
    class Tipo(models.TextChoices):
        CONSUMO = 'CONSUMO', 'Consumo'
        REPOSICION = 'REPOSICION', 'Reposición'

    tipo = models.CharField(max_length=15, choices=Tipo.choices)
    observacion = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Movimiento'
        verbose_name_plural = 'Movimientos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_tipo_display()} #{self.id} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"


class DetalleMovimiento(models.Model):
    movimiento = models.ForeignKey(Movimiento, related_name='detalles', on_delete=models.CASCADE)
    insumo = models.ForeignKey(Insumo, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()

    class Meta:
        verbose_name = 'Detalle de Movimiento'
        verbose_name_plural = 'Detalles de Movimiento'

    def __str__(self):
        return f"{self.cantidad} x {self.insumo.nombre}"
