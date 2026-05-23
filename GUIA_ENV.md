# 📁 Guía Completa de Archivos .env en el Proyecto Atila

## 🗂️ Estructura Actual de Archivos .env

```
Atila_Proyect/
│
├── .env                          ✅ EXISTE (gitignored)
├── .env.example                  ✅ EXISTE (commiteado)
│
├── BACKEND/atila/
│   └── (usa el .env de la raíz)
│
└── FRONTEND/atila-front/
    ├── .env.local                ❌ NO EXISTE (opcional)
    └── .env.local.example        ✅ EXISTE (commiteado)
```

---

## 📋 Tipos de Archivos .env y su Propósito

### 🔴 Backend (Django)

#### 1. `.env` (Raíz del proyecto)
- **Ubicación**: `Atila_Proyect/.env`
- **Estado**: ✅ Existe
- **Git**: 🚫 Ignorado (NO se commitea)
- **Propósito**: Contiene TODAS las credenciales reales del backend
- **Usado por**: Django (`settings.py`)
- **Contiene**:
  - SECRET_KEY
  - Credenciales de base de datos
  - Credenciales de email
  - Configuración CORS/CSRF
  - FRONTEND_URL

#### 2. `.env.example` (Raíz del proyecto)
- **Ubicación**: `Atila_Proyect/.env.example`
- **Estado**: ✅ Existe
- **Git**: ✅ Commiteado (SÍ se sube al repo)
- **Propósito**: Plantilla con valores de ejemplo (SIN credenciales reales)
- **Usado por**: Documentación para otros desarrolladores
- **Contiene**: Mismas variables que `.env` pero con valores placeholder

---

### 🔵 Frontend (Vite/React)

#### 3. `.env.local` (Frontend)
- **Ubicación**: `FRONTEND/atila-front/.env.local`
- **Estado**: ❌ NO existe (opcional)
- **Git**: 🚫 Ignorado (NO se commitea)
- **Propósito**: Variables de entorno locales del frontend
- **Usado por**: Vite durante desarrollo y build
- **Contiene**: `VITE_API_URL=http://127.0.0.1:8000/api/`
- **Necesario**: ❌ NO (hay fallback en el código)

#### 4. `.env.local.example` (Frontend)
- **Ubicación**: `FRONTEND/atila-front/.env.local.example`
- **Estado**: ✅ Existe
- **Git**: ✅ Commiteado (SÍ se sube al repo)
- **Propósito**: Plantilla para configuración del frontend
- **Usado por**: Documentación
- **Contiene**: Ejemplo de `VITE_API_URL`

---

## 🎯 Tipos de .env según Entorno (Vite)

Vite soporta múltiples archivos `.env` con prioridad:

| Archivo | Cuándo se usa | Commiteado | Descripción |
|---------|---------------|------------|-------------|
| `.env` | Todos los entornos | ✅ Sí | Variables base compartidas |
| `.env.local` | Todos los entornos | 🚫 No | Sobrescribe `.env` localmente |
| `.env.development` | `npm run dev` | ✅ Sí | Solo en desarrollo |
| `.env.development.local` | `npm run dev` | 🚫 No | Desarrollo local (sobrescribe) |
| `.env.production` | `npm run build` | ✅ Sí | Solo en producción |
| `.env.production.local` | `npm run build` | 🚫 No | Producción local (sobrescribe) |

**Orden de prioridad** (mayor a menor):
1. `.env.[mode].local` (ej: `.env.production.local`)
2. `.env.[mode]` (ej: `.env.production`)
3. `.env.local`
4. `.env`

---

## 📝 Resumen de lo que TIENES actualmente

### ✅ Archivos que EXISTEN:
1. `Atila_Proyect/.env` - Backend real (gitignored)
2. `Atila_Proyect/.env.example` - Backend plantilla (commiteado)
3. `FRONTEND/atila-front/.env.local.example` - Frontend plantilla (commiteado)

### ❌ Archivos que NO EXISTEN (pero podrías crear):
1. `FRONTEND/atila-front/.env.local` - Frontend local (opcional)
2. `FRONTEND/atila-front/.env.production.local` - Para builds de producción

---

## 🛡️ Protección en .gitignore

### Backend (.gitignore raíz):
```gitignore
.env
.venv
env/
venv/
```

### Frontend (.gitignore):
```gitignore
.env
.env.local
.env.*.local
*.local
```

---

## 💡 Recomendaciones

### Para Desarrollo Local:
- ✅ **Backend**: Usa el `.env` actual (ya funciona)
- ❌ **Frontend**: NO necesitas `.env.local` (el fallback funciona)

### Para Producción:
- ✅ **Backend**: Copia `.env.example` → `.env` y llena con credenciales reales
- ✅ **Frontend**: Crea `.env.production.local` con:
  ```bash
  VITE_API_URL=https://api.tudominio.com/api/
  ```

### Para Trabajo en Equipo:
- ✅ Cada desarrollador copia `.env.example` → `.env`
- ✅ Cada uno configura sus propias credenciales locales
- ✅ Nunca commitear archivos `.env` reales

---

## 🚀 Comandos Útiles

### Crear .env.local para frontend (si lo necesitas):
```bash
cd FRONTEND/atila-front
cp .env.local.example .env.local
# Editar .env.local con tus valores
```

### Verificar qué archivos .env existen:
```bash
# Windows PowerShell
Get-ChildItem -Path . -Filter ".env*" -Recurse -File

# Linux/Mac
find . -name ".env*" -type f
```

### Verificar qué está gitignored:
```bash
git status --ignored
```
