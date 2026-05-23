import random
from django.core.management.base import BaseCommand
from servicios.models import Servicio, Convenio

class Command(BaseCommand):
    help = 'Populates the database with mock Services and Convenios'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database...')

        # Services Data
        services_data = [
            {"nombre": "Consulta General", "precio": 35000, "descripcion": "Atención médica primaria para evaluación general."},
            {"nombre": "Examen de Sangre Completo", "precio": 15000, "descripcion": "Hemograma completo y perfil bioquímico."},
            {"nombre": "Radiografía de Tórax", "precio": 25000, "descripcion": "Imagenología básica de tórax anteroposterior."},
            {"nombre": "Ecografía Abdominal", "precio": 45000, "descripcion": "Ultrasonido de órganos abdominales."},
            {"nombre": "Consulta Especialidad Cardiología", "precio": 50000, "descripcion": "Evaluación por especialista cardiólogo."},
            {"nombre": "Electrocardiograma", "precio": 20000, "descripcion": "Registro de la actividad eléctrica del corazón."},
            {"nombre": "Consulta Dental", "precio": 30000, "descripcion": "Revisión dental y diagnóstico."},
            {"nombre": "Limpieza Dental", "precio": 40000, "descripcion": "Destartraje y profilaxis dental."},
            {"nombre": "Consulta Psicología", "precio": 35000, "descripcion": "Sesión de terapia psicológica."},
            {"nombre": "Kinesiología", "precio": 28000, "descripcion": "Sesión de rehabilitación física."},
            {"nombre": "Nutricionista", "precio": 30000, "descripcion": "Evaluación y plan nutricional."},
            {"nombre": "Resonancia Magnética", "precio": 120000, "descripcion": "Imagenología de alta resolución."},
            {"nombre": "Test de Esfuerzo", "precio": 55000, "descripcion": "Prueba de rendimiento cardíaco bajo esfuerzo."},
            {"nombre": "Holter de Arritmia", "precio": 60000, "descripcion": "Monitoreo cardíaco de 24 horas."}
        ]

        created_services = []
        for data in services_data:
            service, created = Servicio.objects.get_or_create(
                nombre=data["nombre"],
                defaults={
                    "precio": data["precio"],
                    "descripcion": data["descripcion"]
                }
            )
            created_services.append(service)
            if created:
                self.stdout.write(f'Created Service: {service.nombre}')
            else:
                self.stdout.write(f'Service already exists: {service.nombre}')

        # Convenios Data
        convenios_data = [
            {"nombre": "Plan Fonasa Libre Elección", "tipo": "FONASA", "descripcion": "Cobertura estándar para beneficiarios Fonasa."},
            {"nombre": "Isapre Colmena Plan Dorado", "tipo": "ISAPRE", "descripcion": "Cobertura preferencial para afiliados Colmena."},
            {"nombre": "Isapre Cruz Blanca", "tipo": "ISAPRE", "descripcion": "Convenio especial para prestaciones ambulatorias."},
            {"nombre": "Seguro Complementario Bice Vida", "tipo": "PARTICULAR", "descripcion": "Reembolso adicional sobre cobertura base."},
            {"nombre": "Convenio Empresa Minera", "tipo": "OTRO", "descripcion": "Atención prioritaria para trabajadores de minería."},
            {"nombre": "Plan Adulto Mayor", "tipo": "FONASA", "descripcion": "Descuentos especiales para tercera edad."},
        ]

        for data in convenios_data:
            convenio, created = Convenio.objects.get_or_create(
                nombre=data["nombre"],
                defaults={
                    "tipo": data["tipo"],
                    "descripcion": data["descripcion"]
                }
            )
            
            # Randomly assign 3 to 8 services to each convenio
            num_services = random.randint(3, 8)
            selected_services = random.sample(created_services, k=min(num_services, len(created_services)))
            convenio.servicios.set(selected_services)
            convenio.save()

            if created:
                self.stdout.write(f'Created Convenio: {convenio.nombre} with {len(selected_services)} services')
            else:
                self.stdout.write(f'Updated Convenio: {convenio.nombre} with new random services')

        self.stdout.write(self.style.SUCCESS('Successfully populated database'))
