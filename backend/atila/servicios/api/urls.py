from rest_framework.routers import DefaultRouter
from servicios.api.views import ServicioViewSet, ConvenioViewSet, EspecialidadViewSet, RequisitoViewSet

router = DefaultRouter()
router.register(r'especialidades', EspecialidadViewSet, basename='especialidad')
router.register(r'servicios', ServicioViewSet, basename='servicio')
router.register(r'convenios', ConvenioViewSet, basename='convenio')
router.register(r'requisitos', RequisitoViewSet, basename='requisito')

urlpatterns = router.urls
