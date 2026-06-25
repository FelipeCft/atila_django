import os
import django
import sys
from datetime import datetime, timedelta, time

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atila.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from agenda.models import Cita, HorarioDisponible
from servicios.models import Servicio

def populate_upcoming_appointments():
    print("=" * 60)
    print("INICIANDO POBLAMIENTO DE CITAS AGENDADAS")
    print("=" * 60)

    # 1. Obtener profesionales y clientes
    professionals = User.objects.filter(profile__role='STAFF')
    clients = list(User.objects.filter(profile__role='CLIENT'))
    
    if not professionals.exists():
        print("ERROR: No se encontraron profesionales en la base de datos.")
        return

    if not clients:
        print("No se encontraron clientes. Creando algunos clientes de prueba...")
        client_data = [
            {"username": "cliente_test1", "first_name": "Pedro", "last_name": "Ramírez", "email": "pedro@example.com"},
            {"username": "cliente_test2", "first_name": "Laura", "last_name": "Castillo", "email": "laura@example.com"},
            {"username": "cliente_test3", "first_name": "Miguel", "last_name": "Ferrer", "email": "miguel@example.com"},
        ]
        for c_info in client_data:
            user, created = User.objects.get_or_create(
                username=c_info["username"],
                defaults={
                    "first_name": c_info["first_name"],
                    "last_name": c_info["last_name"],
                    "email": c_info["email"],
                }
            )
            if created:
                user.set_password("atila123")
                user.save()
                profile = user.profile
                profile.role = 'CLIENT'
                profile.is_verified = True
                profile.save()
                print(f"Cliente creado: {user.get_full_name()}")
        clients = list(User.objects.filter(profile__role='CLIENT'))

    # Lista de observaciones realistas para citas agendadas
    observaciones_list = [
        "Control rutinario de seguimiento.",
        "Paciente solicita chequeo general por síntomas leves.",
        "Consulta de primera vez recomendada por familiar.",
        "Seguimiento de tratamiento iniciado la semana pasada.",
        "Paciente nuevo para evaluación diagnóstica.",
        "Revisión de exámenes médicos recientes."
    ]

    import random
    
    # Obtener el día actual en la zona horaria de la clínica
    tz = timezone.get_current_timezone()
    today = timezone.localtime(timezone.now()).date()
    print(f"Fecha actual (Local): {today}")

    citas_creadas = 0

    # Para cada profesional
    for prof in professionals:
        print(f"\nProcesando profesional: {prof.get_full_name()} ({prof.username}) - {prof.profile.position}")
        
        # Obtener los servicios disponibles para este profesional
        specialties = prof.especialidades.all()
        services = list(Servicio.objects.filter(especialidad__in=specialties, activo=True))
        
        if not services:
            print(f"  AVISO: El profesional {prof.username} no tiene servicios asociados. Usando cualquier servicio activo...")
            services = list(Servicio.objects.filter(activo=True))
            
        if not services:
            print(f"  ERROR: No hay servicios disponibles en el sistema.")
            continue

        citas_profesional = 0
        day_offset = 1  # Empezar a buscar desde mañana
        max_days_to_search = 15
        
        # Intentaremos agendar 4 citas, preferiblemente en días distintos
        while citas_profesional < 4 and day_offset < max_days_to_search:
            target_date = today + timedelta(days=day_offset)
            weekday = target_date.weekday()
            
            # Buscar si el profesional tiene horario disponible este día de la semana
            hd = HorarioDisponible.objects.filter(profesional=prof, dia_semana=weekday).first()
            if hd:
                # Proponer horas para este día de la semana que estén dentro de su horario de atención.
                # E.g. Si atiende de 9:00 a 17:00, podemos probar varios horarios posibles
                posibles_horas = [
                    time(9, 0), time(10, 0), time(11, 0), time(12, 0),
                    time(14, 0), time(15, 0), time(16, 0)
                ]
                # Barajar para que no todas las citas queden a la misma hora exacta
                random.shuffle(posibles_horas)
                
                cita_agendada_hoy = False
                for hora_propuesta in posibles_horas:
                    # Verificar que la hora propuesta esté dentro de su HorarioDisponible
                    if hd.hora_inicio <= hora_propuesta <= hd.hora_fin:
                        # Elegir un servicio aleatorio
                        service = random.choice(services)
                        duracion_min = service.duracion
                        
                        # Calcular fin
                        start_dt_naive = datetime.combine(target_date, hora_propuesta)
                        start_dt = timezone.make_aware(start_dt_naive, tz)
                        end_dt = start_dt + timedelta(minutes=duracion_min)
                        
                        # Verificar que el fin también esté dentro del horario del profesional
                        limit_fin_naive = datetime.combine(target_date, hd.hora_fin)
                        limit_fin = timezone.make_aware(limit_fin_naive, tz)
                        
                        if end_dt > limit_fin:
                            continue
                            
                        # Verificar solapamiento con otras citas del profesional
                        overlap = Cita.objects.filter(
                            profesional=prof,
                            inicio__lt=end_dt,
                            fin__gt=start_dt
                        ).exists()
                        
                        if not overlap:
                            # Seleccionar cliente aleatorio
                            client = random.choice(clients)
                            observaciones = random.choice(observaciones_list)
                            
                            # Crear cita
                            cita = Cita.objects.create(
                                cliente=client,
                                profesional=prof,
                                servicio=service,
                                inicio=start_dt,
                                fin=end_dt,
                                estado='CONFIRMED',
                                observaciones=observaciones
                            )
                            
                            citas_profesional += 1
                            citas_creadas += 1
                            print(f"  [CREADA] Cita {citas_profesional}/4:")
                            print(f"    - Paciente: {client.get_full_name()} ({client.username})")
                            print(f"    - Servicio: {service.nombre} ({duracion_min} min)")
                            print(f"    - Fecha/Hora: {timezone.localtime(start_dt).strftime('%Y-%m-%d %H:%M')} a {timezone.localtime(end_dt).strftime('%H:%M')}")
                            print(f"    - Estado: {cita.get_estado_display()}")
                            
                            cita_agendada_hoy = True
                            break  # Ir al siguiente día para esta profesional
                            
            # Avanzar al siguiente día
            day_offset += 1
            
        if citas_profesional < 4:
            print(f"  AVISO: Solo se pudieron programar {citas_profesional} citas para {prof.get_full_name()} dentro de los próximos {max_days_to_search} días.")

    print("\n" + "=" * 60)
    print(f"PROCESO FINALIZADO. Se crearon {citas_creadas} citas en total.")
    print("=" * 60)

if __name__ == "__main__":
    populate_upcoming_appointments()
