from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsumoViewSet, MovimientoViewSet

router = DefaultRouter()
router.register(r'movimientos', MovimientoViewSet)
router.register(r'', InsumoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
