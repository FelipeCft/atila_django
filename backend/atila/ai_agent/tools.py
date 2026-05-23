import re
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from langchain_core.tools import tool

from servicios.models import Servicio, Convenio
from agenda.models import HorarioDisponible, Cita, HorarioGeneral, SolicitudCita
from .models import ChatSession

User = get_user_model()

@tool
def consultar_servicios(query: str = "") -> str:
    """Consulta los servicios disponibles en la clínica."""
    from django.db.models import Q
    servicios = Servicio.objects.filter(activo=True)
    
    if query:
        qx = query.lower()
        if 'dentist' in qx or 'diente' in qx:
            query = 'Odontología'
        elif 'kine' in qx or 'masaj' in qx:
            query = 'Kinesiología'
            
        servicios = servicios.filter(Q(nombre__icontains=query) | Q(especialidad__nombre__icontains=query))
    
    if not servicios.exists():
        return f"No encontré servicios para '{query}'."
        
    resultado = "SERVICIOS DISPONIBLES:\n"
    for s in servicios:
        esp = s.especialidad.nombre if s.especialidad else "General"
        profs = s.especialidad.profesionales.all() if s.especialidad else None
        profesionales = ", ".join([p.profile.full_name for p in profs]) if profs and profs.exists() else "No asignado"
        
        resultado += f"- **{s.nombre}** ({esp} | {profesionales}): ${s.precio}. {s.duracion} min. {s.descripcion}\n"
        convenios = s.convenios.filter(activo=True)
        if convenios.exists():
            resultado += f"  - Convenios: {', '.join([c.nombre for c in convenios])}\n"
    
    return resultado

@tool
def consultar_convenios() -> str:
    """Consulta convenios (FONASA, Isapres) y promociones vigentes."""
    convenios = Convenio.objects.filter(activo=True)
    if not convenios.exists():
        return "No hay convenios activos."

    resultado = "CONVENIOS Y PROMOCIONES:\n"
    for c in convenios:
        reqs = c.requisitos.filter(activo=True)
        reqs_str = ", ".join([r.nombre for r in reqs]) if reqs.exists() else "Ninguno"
        resultado += f"- **{c.nombre}**: {c.descripcion or 'Sin descripción'}. Requisitos: {reqs_str}\n"
    return resultado

@tool
def consultar_convenios_servicio(servicio_nombre: str) -> str:
    """Consulta los convenios específicos disponibles para un servicio en particular."""
    from django.db.models import Q

    # Buscar el servicio
    servicios = Servicio.objects.filter(activo=True)
    servicios = servicios.filter(Q(nombre__icontains=servicio_nombre))

    if not servicios.exists():
        return f"No encontré el servicio '{servicio_nombre}'."

    servicio = servicios.first()
    convenios = servicio.convenios.filter(activo=True)

    if not convenios.exists():
        return f"El servicio '{servicio.nombre}' no tiene convenios asociados."

    resultado = f"CONVENIOS DISPONIBLES PARA '{servicio.nombre.upper()}':\n"
    for c in convenios:
        reqs = c.requisitos.filter(activo=True)
        reqs_str = ", ".join([r.nombre for r in reqs]) if reqs.exists() else "Ninguno"
        resultado += f"- **{c.nombre}**: {c.descripcion or 'Sin descripción'}. Requisitos: {reqs_str}\n"

    return resultado

@tool
def consultar_servicios_convenio(convenio_nombre: str) -> str:
    """Consulta los servicios que aceptan un convenio específico."""
    from django.db.models import Q

    # Buscar el convenio
    convenios = Convenio.objects.filter(activo=True)
    convenios = convenios.filter(Q(nombre__icontains=convenio_nombre))

    if not convenios.exists():
        return f"No encontré el convenio '{convenio_nombre}'."

    convenio = convenios.first()
    servicios = convenio.servicios.filter(activo=True)

    if not servicios.exists():
        return f"El convenio '{convenio.nombre}' no tiene servicios asociados."

    resultado = f"SERVICIOS QUE ACEPTAN '{convenio.nombre.upper()}':\n"
    for s in servicios:
        esp = s.especialidad.nombre if s.especialidad else "General"
        profs = s.especialidad.profesionales.all() if s.especialidad else None
        profesionales = ", ".join([p.profile.full_name for p in profs]) if profs and profs.exists() else "No asignado"

        resultado += f"- **{s.nombre}** ({esp} | {profesionales}): ${s.precio}. {s.duracion} min.\n"

    return resultado

@tool
def consultar_disponibilidad_semanal(profesional_nombre: str) -> str:
    """Retorna las horas disponibles de un profesional para los próximos 7 días."""
    from django.db.models import Q
    
    nombres = profesional_nombre.lower().replace('dr. ', '').replace('dra ', '').replace('doctor ', '').strip()
    if not nombres: return "Indica un nombre de profesional."
        
    query = Q(profile__role='STAFF')
    for t in nombres.split():
        query &= (Q(first_name__icontains=t) | Q(last_name__icontains=t))
        
    profesional = User.objects.filter(query).first()
    if not profesional:
        return f"No encontré al profesional '{profesional_nombre}'."
        
    ahora = timezone.localtime()
    hoy = ahora.date()
    resultado = f"Disponibilidad para {profesional.profile.full_name}:\n"
    hay_disponibilidad = False

    for i in range(7):
        fecha = hoy + timedelta(days=i)
        dia_num = fecha.weekday()
        
        # VALIDACIÓN: ¿La clínica atiende este día?
        try:
            horario_clinica = HorarioGeneral.objects.get(dia_semana=dia_num)
            if not horario_clinica.activo: continue
        except HorarioGeneral.DoesNotExist: continue

        horarios_prof = HorarioDisponible.objects.filter(profesional=profesional, dia_semana=dia_num)
        if not horarios_prof.exists(): continue
            
        slots_dia = []
        for h in horarios_prof:
            start_dt = timezone.make_aware(datetime.combine(fecha, h.hora_inicio))
            end_dt = timezone.make_aware(datetime.combine(fecha, h.hora_fin))
            
            if fecha == hoy and ahora >= end_dt: continue
                
            citas = Cita.objects.filter(
                profesional=profesional,
                inicio__gte=max(start_dt, ahora) if fecha == hoy else start_dt,
                inicio__lt=end_dt,
                estado__in=['PENDING', 'CONFIRMED']
            )

            ocupados = [(c.inicio, c.fin) for c in citas]
            current = max(start_dt, ahora) if fecha == hoy else start_dt
            
            # Redondear al bloque de 30 min
            if current.minute % 30 != 0:
                current = current.replace(second=0, microsecond=0) + timedelta(minutes=(30 - current.minute % 30))

            while current + timedelta(minutes=30) <= end_dt:
                fin_slot = current + timedelta(minutes=30)
                if not any(current < o_fin and fin_slot > o_inicio for o_inicio, o_fin in ocupados):
                    slots_dia.append(current.strftime('%H:%M'))
                current += timedelta(minutes=30)

        if slots_dia:
            # Limitar a máximo 5 horas por día para no abrumar al paciente
            slots_mostrar = slots_dia[:5]
            mas_disponibles = f" (y {len(slots_dia) - 5} más)" if len(slots_dia) > 5 else ""
            resultado += f"\n**{fecha.strftime('%d/%m (%A)')}**{mas_disponibles}:\n- {', '.join(slots_mostrar)}\n"
            hay_disponibilidad = True
            
    return resultado if hay_disponibilidad else f"Sin disponibilidad para {profesional.profile.full_name} en 7 días."

@tool
def validar_datos_contacto(telefono: str, email: str = "") -> str:
    """Valida formato de teléfono (9 dígitos) y email."""
    tel_clean = ''.join(filter(str.isdigit, str(telefono)))
    if not re.match(r'^(9\d{8}|2\d{7})$', tel_clean):
        return f"Teléfono '{telefono}' inválido. Usa 9XXXXXXXX o código de área."
        
    if email and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email.strip()):
        return f"Correo '{email}' inválido."
            
    # Verificar si existe
    user = User.objects.filter(Q(email__iexact=email) | Q(profile__phone_number__contains=tel_clean)).first() if email else \
           User.objects.filter(profile__phone_number__contains=tel_clean).first()
            
    if user:
        return f"ÉXITO: Usuario encontrado. Hola {user.first_name or user.profile.full_name.split()[0]}."
        
    return "ÉXITO: Formato correcto. Usuario nuevo."

@tool
def generar_ficha_confirmacion(session_id: str, nombre: str, telefono: str, email: str, servicio: str, profesional: str, fecha_hora: str) -> str:
    """Genera el resumen de la solicitud de cita."""
    try:
        session = ChatSession.objects.get(session_id=session_id)
        session.pending_appointment_data = {
            'nombre': nombre, 'telefono': telefono, 'email': email,
            'servicio': servicio, 'profesional': profesional, 'fecha_hora': fecha_hora
        }
        session.save()

        return f"""### Resumen de Solicitud
| Campo | Detalle |
|---|---|
| **Paciente** | {nombre} |
| **Teléfono** | {telefono} |
| **Servicio** | {servicio} |
| **Profesional** | {profesional} |
| **Fecha/Hora** | {fecha_hora} |

¿Confirmas que los datos son correctos?"""
    except Exception as e:
        return f"ERROR: {str(e)}"

@tool
def finalizar_registro_cita(session_id: str) -> str:
    """Registra definitivamente la solicitud de cita en el sistema."""
    try:
        session = ChatSession.objects.get(session_id=session_id)
        data = session.pending_appointment_data
        if not data: return "ERROR: No hay datos. Genera la ficha primero."

        dt = timezone.now()
        for f in ["%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M", "%Y-%m-%dT%H:%M:%S"]:
            try:
                dt = timezone.make_aware(datetime.strptime(data['fecha_hora'], f))
                break
            except: continue

        SolicitudCita.objects.create(
            paciente_nombre=data['nombre'], paciente_telefono=data['telefono'],
            paciente_email=data['email'], servicio_solicitado=data['servicio'],
            profesional_solicitado=data['profesional'], fecha_hora_solicitada=dt
        )
        session.pending_appointment_data = None
        session.save()
        
        return f"SOLICITUD REGISTRADA: {data['nombre']} para {data['servicio']} con {data['profesional']} el {data['fecha_hora']}."
    except Exception as e:
        return f"ERROR: {str(e)}"
