from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CitaViewSet,
    HorarioDisponibleViewSet,
    HorarioGeneralViewSet,
    DashboardStatsView,
    DashboardAlertsView,
    DashboardTrendsView,
    DashboardActivityView,
    DashboardTopServicesView,
    SolicitudCitaViewSet,
    PublicDoctorAvailabilityView,
)

router = DefaultRouter()
router.register(r'citas', CitaViewSet)
router.register(r'horarios', HorarioDisponibleViewSet)
router.register(r'horarios-general', HorarioGeneralViewSet)
router.register(r'solicitudes-cita', SolicitudCitaViewSet, basename='solicitudcita')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/alerts/', DashboardAlertsView.as_view(), name='dashboard-alerts'),
    path('dashboard/trends/', DashboardTrendsView.as_view(), name='dashboard-trends'),
    path('dashboard/activity/', DashboardActivityView.as_view(), name='dashboard-activity'),
    path('dashboard/top-services/', DashboardTopServicesView.as_view(), name='dashboard-top-services'),
    path('disponibilidad-publica/', PublicDoctorAvailabilityView.as_view(), name='disponibilidad-publica'),
]
