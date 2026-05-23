from django.contrib import admin
from .models import Insumo, Movimiento, DetalleMovimiento


class DetalleMovimientoInline(admin.TabularInline):
    model = DetalleMovimiento
    extra = 0
    readonly_fields = ['insumo', 'cantidad']


@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'cantidad', 'stock_minimo', 'disponible', 'alerta_stock', 'updated_at']
    list_filter = ['disponible']
    search_fields = ['nombre']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['id', 'tipo', 'usuario', 'created_at']
    list_filter = ['tipo']
    readonly_fields = ['created_at']
    inlines = [DetalleMovimientoInline]
