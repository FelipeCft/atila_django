# Informe de Base de Datos y Refactorización

## Estado Actual del Esquema

El proyecto utiliza una base de datos relacional (Django ORM) con las siguientes aplicaciones y modelos principales:

### 1. Users (`users`)
- **Profile**: Extiende el modelo de usuario de Django. Maneja roles (ADMIN, STAFF, CLIENT) y datos perfil.
  - *Observación*: Mezcla de nombres en inglés (`Profile`, `role`) con datos en español (`Administrador`).

### 2. Agenda (`agenda`)
- **Cita**: Núcleo de la agenda. Relaciona Cliente, Profesional y Servicio.
- **HorarioGeneral**: Configuración global de horarios de la clínica.
- **HorarioDisponible**: Disponibilidad específica por profesional (validada contra HorarioGeneral).
- **BloqueoAgenda**: Excepciones de disponibilidad.
  - *Observación*: Buena estructura. La validación en el método `clean` es útil pero puede ser pesada si se hacen cargas masivas.

### 3. Insumos (`insumos`)
- **Insumo**: Inventario base.
- **Consumo** y **Reposicion**: Modelos separados para entradas y salidas.
- **DetalleConsumo** y **DetalleReposicion**: Tablas intermedias para los items.
  - *Observación*: Estructura redundante para movimientos de stock.

### 4. Servicios (`servicios`)
- **Categoria**: Categorización simple.
- **Servicio**: Definición de precios y duración.
- **Convenio**: Agrupa servicios bajo tipos (FONASA, Isapre, etc.).
- **Requisito**: Documentación necesaria para convenios.

### 5. AI Agent (`ai_agent`)
- **ClinicInformation**: Contexto para el bot.
- **ChatSession** y **ChatMessage**: Historial de conversaciones.
  - *Observación*: `ClinicInformation` tiene un método `__cl__` que parece un error tipográfico.

---

## Propuestas de Refactorización

### Prioridad Alta (Crítico / Mantenibilidad)

1.  **Unificar Idioma / Convención de Nombres**:
    -   **Problema**: Hay una mezcla de inglés (`Profile`, `ClinicInformation`, `ChatSession`) y español (`Cita`, `Insumo`, `Servicio`).
    -   **Acción**: Estandarizar a un idioma (recomendado: Inglés para código/modelos, Español para `verbose_name` en admin).
    -   *Ejemplo*: Renombrar `Cita` a `Appointment`, `Insumo` a `Supply`. O viceversa si se prefiere todo en español.

2.  **Consolidación de Movimientos de Inventario (`insumos`)**:
    -   **Problema**: `Consumo` y `Reposicion` son casi idénticos. Duplican lógica.
    -   **Refactor**: Crear un modelo único `InventoryMovement` (o `MovimientoInsumo`) con un campo `tipo` (IN/OUT) y una relación al `Insumo`.
    -   *Beneficio*: Simplifica consultas de historial y cálculo de stock.

3.  **Corrección en `ClinicInformation`**:
    -   **Problema**: Método `__cl__` en línea 8 de `ai_agent/models.py`.
    -   **Acción**: Cambiar a `__str__` para que se muestre correctamente en el admin.

### Prioridad Media (Funcionalidad / Robustez)

4.  **Soft Deletes (Borrado Lógico)**:
    -   **Problema**: Si se borra un `Servicio`, las `Citas` pasadas pierden la referencia (`on_delete=models.SET_NULL`).
    -   **Refactor**: Implementar un campo `is_active` o `deleted_at` para `Servicio` y `Profile`. No borrar registros físicos, solo marcarlos como inactivos.

5.  **Optimización de `HorarioDisponible`**:
    -   **Problema**: La validación depende estrictamente de `HorarioGeneral`. Si la clínica cambia su horario global, los horarios de profesionales antiguos podrían quedar inconsistentes si se re-guardan.
    -   **Acción**: Mantener la validación, pero considerar versionado de horarios si la clínica cambia horas frecuentemente.

### Prioridad Baja (Optimizaciones)

6.  **Índices de Base de Datos**:
    -   **Acción**: Agregar `db_index=True` en campos de búsqueda frecuente:
        -   `Cita.inicio` (para filtrar por fecha).
        -   `Cita.estado`.
        -   `Profile.role`.
        -   `Insumo.nombre`.

7.  **Campos Calculados en Base de Datos**:
    -   **Problema**: `Insumo.alerta_stock` es una propiedad de Python. No se puede filtrar por "Stock Bajo" eficientemente en la DB.
    -   **Refactor**: Usar anotaciones de Django QuerySet o un campo computado si se usa una DB moderna, para permitir filtros directos.

## Pasos Siguientes Recomendados

1.  Corregir el error tipográfico `__cl__` en `ai_agent`.
2.  Decidir la convención de nombres (¿Migrar todo a Inglés?).
3.  Planificar la migración de `Consumo`/`Reposicion` a un modelo unificado.
