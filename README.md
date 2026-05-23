# Atila_Proyect

Proyecto con Django Rest Framework y React utilizando PostgreSQL.

## Instalación

Sigue estos pasos para poner en marcha el proyecto:

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Atila_Proyect
```

### 2. Configurar el Entorno Virtual (Backend)
```bash
cd BACKEND/atila
python -m venv venv
# Activar en Windows:
.\venv\Scripts\activate
# Activar en Linux/Mac:
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install django djangorestframework python-dotenv psycopg2-binary
```

### 4. Configurar Variables de Entorno
Copia el archivo `.env.example` a un nuevo archivo llamado `.env` dentro de `BACKEND/atila/` y completa tus credenciales de PostgreSQL:
```text
DB_NAME=atila_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
```

### 5. Preparar la Base de Datos
Asegúrate de que PostgreSQL esté corriendo y crea la base de datos:
```sql
CREATE DATABASE atila_db;
```

### 6. Ejecutar Migraciones
```bash
python manage.py migrate
```

### 7. Iniciar el Servidor
```bash
python manage.py runserver
```

### 8. Crear Superusuario
```bash
python manage.py createsuperuser
```


### 9. Acceder al Admin
```bash
http://localhost:8000/admin
```

### 10. Crear Perfil
```bash
http://localhost:8000/admin/users/profile
```

BITACORA DE CAMBIOS FECHA: 07/01/2026

1. SE LOGRA LA CREACION DE LA BASE DE DATOS Y LA TABLA DE USUARIOS ACCESIBLE DESDE EL ADMINISTRADOR DE DJANGO.

2. SE LOGRA LA CREACION DE LA TABLA DE PERFILES Y LA RELACION CON EL USUARIO UNO A UNO CON ROLES ADMIN, STAFF Y CLIENTE.

3. TODO VISIBLE DESDE EL ADMINISTRADOR DE DJANGO RESTRICCION FUNCIONANDO.

4.  SUPERUSUARIO DE PRUEBAS CREADO CREDENCIALES PIPELIN 1234 CORREO admin1@gmail.com

BITACORA DE CAMBIOS FECHA: 09/01/2026

5. INTEGRACION FRONTEND-BACKEND COMPLETADA: CONFIGURACION DE CORS Y ENDPOINTS CORRECTOS.

6. IMPLEMENTACION DE LOGIN Y REGISTRO EN REACT CON AUTENTICACION VIA TOKEN (JWT).

7. CREACION DE RUTAS PROTEGIDAS (PROTECTEDROUTE) PARA GESTION DE ACCESO POR ROLES (ADMIN, CLIENT, STAFF).

8. MIGRACION ESTRUCTURAL DEL FRONTEND Y ESTILIZADO CON TAILWIND CSS.

9. REFACTORIZACION DE BACKEND: UNIFICACION DE CONVENCIONES DE NOMBRES EN APP SERVICIOS (SERIALIZERS).

10. VERIFICACION DE ESTABILIDAD: MANEJO DE ERRORES DE AUTENTICACION Y REDIRECCIONES FUNCIONANDO CORRECTAMENTE.
