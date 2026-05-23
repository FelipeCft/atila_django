import logging
from rest_framework import viewsets, permissions, status

logger = logging.getLogger(__name__)
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models import Cita, HorarioDisponible, HorarioGeneral, SolicitudCita
from .serializers import CitaSerializer, HorarioDisponibleSerializer, HorarioGeneralSerializer, SolicitudCitaSerializer
from django.conf import settings
from django.core.mail import send_mail
from django.core import signing
from users.models import Profile  # Still needed for role constants and dashboard counts


class IsAdminOrSuperuser(permissions.BasePermission):
    """
    Allows access to ADMIN-role profiles and superusers.
    Replaces Django's IsAdminUser which only checks user.is_staff.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        try:
            return request.user.profile.role == Profile.Role.ADMIN
        except AttributeError:
            return False


class IsAdminOrStaffOwner(permissions.BasePermission):
    """
    Custom permission:
    - Admin can do anything.
    - Staff can view/edit their own data.
    - Client logic (handled in registration/booking mostly, but for listing, staff sees own).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.profile.role == Profile.Role.ADMIN:
            return True
        if request.user.profile.role == Profile.Role.STAFF:
            # Check if the object belongs to the staff member
            if isinstance(obj, Cita):
                return obj.profesional == request.user
            if isinstance(obj, HorarioDisponible):
                return obj.profesional == request.user
        return False

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated] # We refine in get_queryset

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Cita.objects.none()
        
        if user.profile.role == Profile.Role.ADMIN:
            return Cita.objects.all()
        elif user.profile.role == Profile.Role.STAFF:
            return Cita.objects.filter(profesional=user)
        elif user.profile.role == Profile.Role.CLIENT:
            return Cita.objects.filter(cliente=user)
        return Cita.objects.none()

    def perform_create(self, serializer):
        # Guardar la cita primero
        cita = serializer.save()
        
        if cita.estado == 'CONFIRMED':
            # Cita creada ya confirmada (por admin) → notificar al profesional
            if cita.profesional.email:
                try:
                    send_mail(
                        'Nueva Cita Confirmada - Clínica Atila',
                        (
                            f"Hola {cita.profesional.profile.full_name},\n\n"
                            f"Se te ha asignado una nueva cita confirmada:\n\n"
                            f"Paciente: {cita.cliente.profile.full_name}\n"
                            f"Fecha: {cita.inicio.strftime('%d/%m/%Y %H:%M')}\n"
                            f"Servicio: {cita.servicio.nombre if cita.servicio else 'No especificado'}\n\n"
                            f"Saludos,\n"
                            f"Equipo Clínica Atila"
                        ),
                        settings.DEFAULT_FROM_EMAIL,
                        [cita.profesional.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Error enviando correo al profesional (cita confirmada): {e}", exc_info=True)

            # También notificar al paciente (sin link de confirmación, ya está confirmada)
            if cita.cliente.email:
                try:
                    send_mail(
                        'Tu Cita ha sido Agendada - Clínica Atila',
                        (
                            f"Hola {cita.cliente.profile.full_name},\n\n"
                            f"Se ha agendado y confirmado tu cita:\n\n"
                            f"Profesional: {cita.profesional.profile.full_name}\n"
                            f"Fecha: {cita.inicio.strftime('%d/%m/%Y %H:%M')}\n"
                            f"Servicio: {cita.servicio.nombre if cita.servicio else 'No especificado'}\n\n"
                            f"Saludos,\n"
                            f"Equipo Clínica Atila"
                        ),
                        settings.DEFAULT_FROM_EMAIL,
                        [cita.cliente.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Error enviando correo al paciente (cita confirmada): {e}", exc_info=True)
        else:
            # Cita pendiente → enviar link de confirmación al paciente
            if cita.cliente.email:
                try:
                    signer = signing.TimestampSigner()
                    token = signer.sign(cita.id)
                    confirmation_link = f"{settings.FRONTEND_URL}/confirmar-cita/{token}"
                    
                    send_mail(
                        'Confirmación de Cita - Clínica Atila',
                        (
                            f"Hola {cita.cliente.profile.full_name},\n\n"
                            f"Se ha agendado una nueva cita:\n\n"
                            f"Profesional: {cita.profesional.profile.full_name}\n"
                            f"Fecha: {cita.inicio.strftime('%d/%m/%Y %H:%M')}\n"
                            f"Servicio: {cita.servicio.nombre if cita.servicio else 'No especificado'}\n\n"
                            f"Para confirmar su asistencia, haga clic en el siguiente enlace:\n"
                            f"{confirmation_link}\n\n"
                            f"Saludos,\n"
                            f"Equipo Clínica Atila"
                        ),
                        settings.DEFAULT_FROM_EMAIL,
                        [cita.cliente.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Error enviando correo de confirmación de cita: {e}", exc_info=True)


    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def confirm_cita(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)
        
        signer = signing.TimestampSigner()
        try:
            # Verificar token (valido por 48 horas = 172800 segundos)
            cita_id = signer.unsign(token, max_age=172800)
            cita = Cita.objects.get(id=cita_id)
            
            if cita.estado == 'CONFIRMED':
                 return Response({'message': 'La cita ya fue confirmada previamente'}, status=status.HTTP_200_OK)
                 
            cita.estado = 'CONFIRMED'
            cita.save()

            # Enviar correo al profesional asignado
            if cita.profesional.email:
                try:
                    subject = 'Cita Confirmada - Clínica Atila'
                    message = (
                        f"Hola {cita.profesional.profile.full_name},\n\n"
                        f"El paciente {cita.cliente.profile.full_name} ha confirmado su cita:\n\n"
                        f"Fecha: {cita.inicio.strftime('%d/%m/%Y %H:%M')}\n"
                        f"Servicio: {cita.servicio.nombre if cita.servicio else 'No especificado'}\n\n"
                        f"Saludos,\n"
                        f"Equipo Clínica Atila"
                    )
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [cita.profesional.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Error enviando correo al profesional tras confirmación de cita: {e}", exc_info=True)

            return Response({'message': 'Cita confirmada exitosamente'}, status=status.HTTP_200_OK)
            
        except signing.SignatureExpired:
            return Response({'error': 'El enlace de confirmación ha expirado'}, status=status.HTTP_400_BAD_REQUEST)
        except signing.BadSignature:
            return Response({'error': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)
        except Cita.DoesNotExist:
            return Response({'error': 'Cita no encontrada'}, status=status.HTTP_404_NOT_FOUND)


class HorarioDisponibleViewSet(viewsets.ModelViewSet):
    queryset = HorarioDisponible.objects.all()
    serializer_class = HorarioDisponibleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return HorarioDisponible.objects.none()
            
        if user.profile.role == Profile.Role.ADMIN:
            return HorarioDisponible.objects.all()
        elif user.profile.role == Profile.Role.STAFF:
            return HorarioDisponible.objects.filter(profesional=user)
        # Clients might need to see availability to book?
        # Likely yes, but via a public/open endpoint or filtering by professional.
        # For management (CRUD), only Admin/Staff.
        return HorarioDisponible.objects.none()
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_availability(self, request):
        """
        Public endpoint to get availability for booking.
        Filter by professional_id via query param.
        """
        professional_id = request.query_params.get('professional_id')
        if professional_id:
            horarios = HorarioDisponible.objects.filter(profesional_id=professional_id)
            serializer = self.get_serializer(horarios, many=True)
            return Response(serializer.data)
        return Response([])


from rest_framework import serializers as drf_serializers

class HorarioGeneralViewSet(viewsets.ModelViewSet):
    queryset = HorarioGeneral.objects.all().order_by('dia_semana')
    serializer_class = HorarioGeneralSerializer
    permission_classes = [permissions.IsAuthenticated] # Or IsAdminUser

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_active']:
             # Only admin can manage global hours
             return [IsAdminOrSuperuser()]
        return [permissions.IsAuthenticated()] # Staff/Others can view

    def perform_destroy(self, instance):
        horarios_count = HorarioDisponible.objects.filter(dia_semana=instance.dia_semana).count()
        if horarios_count > 0:
            raise drf_serializers.ValidationError(
                {"detail": f"No se puede eliminar porque hay {horarios_count} horario(s) de profesional(es) configurado(s) para este día. Desactívelo en su lugar."}
            )
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSuperuser])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.activo = not instance.activo
        instance.save()
        estado = 'activado' if instance.activo else 'desactivado'
        return Response({
            'message': f'Horario {estado} exitosamente.',
            'activo': instance.activo,
        })

from datetime import datetime, time, timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from insumos.models import Insumo

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        now = timezone.now()

        # Date ranges
        start_of_day = timezone.make_aware(datetime.combine(today, time.min))
        end_of_day = timezone.make_aware(datetime.combine(today, time.max))
        start_of_month = timezone.make_aware(datetime.combine(today.replace(day=1), time.min))

        # 1. Total Clients
        total_clientes = Profile.objects.filter(role=Profile.Role.CLIENT).count()

        # 2. Appointments Today
        citas_hoy_qs = Cita.objects.filter(inicio__range=(start_of_day, end_of_day))
        total_citas_hoy = citas_hoy_qs.count()

        # 3. Citas por estado hoy
        citas_confirmadas_hoy = citas_hoy_qs.filter(estado='CONFIRMED').count()
        citas_pendientes_hoy = citas_hoy_qs.filter(estado='PENDING').count()
        citas_completadas_hoy = citas_hoy_qs.filter(estado='COMPLETED').count()
        citas_canceladas_hoy = citas_hoy_qs.filter(estado='CANCELLED').count()

        # 4. Upcoming Appointments Today
        proximas_citas_qs = citas_hoy_qs.filter(inicio__gte=now).order_by('inicio')
        proximas_citas_data = []
        for cita in proximas_citas_qs:
            proximas_citas_data.append({
                'id': cita.id,
                'cliente_nombre': cita.cliente.profile.full_name,
                'hora_inicio': cita.inicio.strftime('%H:%M'),
                'servicio_nombre': cita.servicio.nombre if cita.servicio else 'Sin servicio',
                'estado': cita.estado,
                'profesional_nombre': cita.profesional.profile.full_name
            })

        # 5. Solicitudes de cita
        solicitudes_pendientes = SolicitudCita.objects.filter(estado='PENDIENTE').count()
        solicitudes_nuevas_24h = SolicitudCita.objects.filter(
            creado_en__gte=now - timedelta(hours=24)
        ).count()

        # 6. Insumos
        insumos_agotados = Insumo.objects.filter(cantidad=0).count()
        insumos_stock_bajo = Insumo.objects.filter(
            cantidad__gt=0,
            cantidad__lte=models.F('stock_minimo')
        ).count()

        # 7. Nuevos clientes este mes
        nuevos_clientes_mes = Profile.objects.filter(
            role=Profile.Role.CLIENT,
            user__date_joined__gte=start_of_month
        ).count()

        # 8. Personal activo (profesionales)
        personal_activo = Profile.objects.filter(role=Profile.Role.STAFF).count()

        # 9. Citas completadas este mes
        citas_completadas_mes = Cita.objects.filter(
            estado='COMPLETED',
            inicio__gte=start_of_month
        ).count()

        # 10. Tasa de cancelación (este mes)
        citas_mes = Cita.objects.filter(inicio__gte=start_of_month)
        total_citas_mes = citas_mes.count()
        canceladas_mes = citas_mes.filter(estado='CANCELLED').count()
        tasa_cancelacion = round((canceladas_mes / total_citas_mes * 100), 1) if total_citas_mes > 0 else 0

        # 11. Tasa de asistencia (citas completadas vs total programadas en el mes)
        tasa_asistencia = round((citas_completadas_mes / total_citas_mes * 100), 1) if total_citas_mes > 0 else 0

        return Response({
            'total_clientes': total_clientes,
            'total_citas_hoy': total_citas_hoy,
            'citas_confirmadas_hoy': citas_confirmadas_hoy,
            'citas_pendientes_hoy': citas_pendientes_hoy,
            'citas_completadas_hoy': citas_completadas_hoy,
            'citas_canceladas_hoy': citas_canceladas_hoy,
            'proximas_citas': proximas_citas_data,
            'solicitudes_pendientes': solicitudes_pendientes,
            'solicitudes_nuevas_24h': solicitudes_nuevas_24h,
            'insumos_agotados': insumos_agotados,
            'insumos_stock_bajo': insumos_stock_bajo,
            'nuevos_clientes_mes': nuevos_clientes_mes,
            'personal_activo': personal_activo,
            'citas_completadas_mes': citas_completadas_mes,
            'tasa_cancelacion': tasa_cancelacion,
            'tasa_asistencia': tasa_asistencia,
        })

class DashboardAlertsView(APIView):
    """Endpoint para obtener alertas en tiempo real del sistema"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        alerts = []

        # Alertas de insumos agotados
        insumos_agotados = Insumo.objects.filter(cantidad=0)
        for insumo in insumos_agotados:
            alerts.append({
                'type': 'danger',
                'icon': 'alert-circle',
                'message': f'{insumo.nombre} está agotado',
                'category': 'inventario'
            })

        # Alertas de stock bajo
        insumos_bajo = Insumo.objects.filter(
            cantidad__gt=0,
            cantidad__lte=models.F('stock_minimo')
        )[:5]  # Limitar a 5
        for insumo in insumos_bajo:
            alerts.append({
                'type': 'warning',
                'icon': 'alert-triangle',
                'message': f'{insumo.nombre} tiene stock bajo ({insumo.cantidad} unidades)',
                'category': 'inventario'
            })

        # Solicitudes pendientes
        solicitudes_pendientes = SolicitudCita.objects.filter(estado='PENDIENTE').count()
        if solicitudes_pendientes > 0:
            alerts.append({
                'type': 'info',
                'icon': 'message-square',
                'message': f'{solicitudes_pendientes} solicitud{"es" if solicitudes_pendientes > 1 else ""} pendiente{"s" if solicitudes_pendientes > 1 else ""} de contactar',
                'category': 'solicitudes'
            })

        # Citas próximas (en las próximas 2 horas)
        dos_horas = now + timedelta(hours=2)
        citas_proximas = Cita.objects.filter(
            inicio__gte=now,
            inicio__lte=dos_horas,
            estado__in=['PENDING', 'CONFIRMED']
        ).count()
        if citas_proximas > 0:
            alerts.append({
                'type': 'info',
                'icon': 'clock',
                'message': f'{citas_proximas} cita{"s" if citas_proximas > 1 else ""} en las próximas 2 horas',
                'category': 'citas'
            })

        return Response({
            'alerts': alerts,
            'total': len(alerts)
        })


class DashboardTrendsView(APIView):
    """Endpoint para obtener datos de tendencia de citas"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        days = int(request.query_params.get('days', 7))  # Por defecto 7 días

        # Nombres de días en español
        dias_es = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

        trend_data = []
        for i in range(days - 1, -1, -1):
            date = today - timedelta(days=i)
            start = timezone.make_aware(datetime.combine(date, time.min))
            end = timezone.make_aware(datetime.combine(date, time.max))

            total = Cita.objects.filter(inicio__range=(start, end)).count()
            confirmadas = Cita.objects.filter(inicio__range=(start, end), estado='CONFIRMED').count()
            completadas = Cita.objects.filter(inicio__range=(start, end), estado='COMPLETED').count()
            canceladas = Cita.objects.filter(inicio__range=(start, end), estado='CANCELLED').count()

            # Obtener día de la semana (0=Lunes, 6=Domingo)
            day_of_week = date.weekday()

            trend_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': dias_es[day_of_week],
                'total': total,
                'confirmadas': confirmadas,
                'completadas': completadas,
                'canceladas': canceladas
            })

        return Response({
            'trends': trend_data,
            'period_days': days
        })


class DashboardActivityView(APIView):
    """Endpoint para obtener actividad reciente del sistema"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        activities = []

        # Últimas citas creadas/modificadas
        recent_citas = Cita.objects.all().order_by('-created_at')[:limit]
        for cita in recent_citas:
            time_ago = self._get_time_ago(cita.created_at)
            activities.append({
                'type': 'cita',
                'icon': 'calendar',
                'message': f'{cita.cliente.profile.full_name} agendó cita con {cita.profesional.profile.full_name}',
                'time': time_ago,
                'timestamp': cita.created_at.isoformat()
            })

        # Últimas solicitudes
        recent_solicitudes = SolicitudCita.objects.all().order_by('-creado_en')[:limit//2]
        for sol in recent_solicitudes:
            time_ago = self._get_time_ago(sol.creado_en)
            activities.append({
                'type': 'solicitud',
                'icon': 'message-square',
                'message': f'Nueva solicitud de {sol.paciente_nombre}',
                'time': time_ago,
                'timestamp': sol.creado_en.isoformat()
            })

        # Ordenar por timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)

        return Response({
            'activities': activities[:limit]
        })

    def _get_time_ago(self, dt):
        """Calcula el tiempo transcurrido en formato amigable"""
        now = timezone.now()
        diff = now - dt

        if diff.days > 0:
            if diff.days == 1:
                return 'hace 1 día'
            return f'hace {diff.days} días'

        hours = diff.seconds // 3600
        if hours > 0:
            if hours == 1:
                return 'hace 1 hora'
            return f'hace {hours} horas'

        minutes = diff.seconds // 60
        if minutes > 0:
            if minutes == 1:
                return 'hace 1 minuto'
            return f'hace {minutes} minutos'

        return 'hace unos segundos'


class DashboardTopServicesView(APIView):
    """Endpoint para obtener los servicios más solicitados"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        from servicios.models import Servicio

        limit = int(request.query_params.get('limit', 5))
        period_days = int(request.query_params.get('days', 30))

        date_from = timezone.now() - timedelta(days=period_days)

        # Contar citas por servicio
        top_services = Cita.objects.filter(
            inicio__gte=date_from,
            servicio__isnull=False
        ).values(
            'servicio__nombre',
            'servicio__id'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:limit]

        services_data = []
        for service in top_services:
            services_data.append({
                'nombre': service['servicio__nombre'],
                'cantidad': service['count']
            })

        return Response({
            'services': services_data,
            'period_days': period_days
        })


class SolicitudCitaViewSet(viewsets.ModelViewSet):
    queryset = SolicitudCita.objects.all().order_by('-creado_en')
    serializer_class = SolicitudCitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return SolicitudCita.objects.none()

        # Only ADMIN and STAFF should see these requests
        if user.profile.role in [Profile.Role.ADMIN, Profile.Role.STAFF]:
            return SolicitudCita.objects.all().order_by('-creado_en')
        return SolicitudCita.objects.none()
