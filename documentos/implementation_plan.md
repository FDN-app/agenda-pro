# Plan de Implementación: Agenda Pro (Fase 1 a 4)

Este plan redefine el desarrollo del sistema de gestión de turnos dentales, priorizando la integración con WhatsApp Cloud API (vía n8n) y eliminando el portal de reserva web. El paciente interactuará exclusivamente por WhatsApp.

## User Review Required

> [!IMPORTANT]
> **Arquitectura de Webhooks:** El Dashboard (TanStack Start) actuará como receptor de datos de n8n (para crear turnos/solicitudes) y como emisor (para notificar a n8n cuando la dentista aprueba un turno o responde una consulta).
> **WhatsApp Cloud API:** n8n se encargará de la lógica de envío/recepción directa con Meta. El Dashboard solo guardará las plantillas y el historial.

---

## Diferencias Clave con el Plan Anterior
- **Eliminado:** Almacenamiento de radiografías/imágenes.
- **Eliminado:** Fase 3 (Reserva Web). La ruta `/book` no existe.
- **Agregado:** Flujo de "Consulta Previa".
- **Agregado:** Lógica de auto-confirmación automática para clientes activos.
- **Agregado:** Exposición de endpoints para n8n.

---

## Fases del Proyecto

### Fase 1: Cimientos, Base de Datos y Auth
Configuración del ecosistema de Supabase y esquemas de datos.

#### Base de Datos (Supabase)
- **Tablas:**
    - `pacientes`: `id`, `nombre`, `apellido`, `telefono`, `dni`, `obra_social`, `observaciones` (textarea), `estado` (nuevo/activo/bloqueado), `created_at`.
    - `servicios`: `id`, `nombre`, `duracion_min`, `color`, `activo`.
    - `turnos`: `id`, `paciente_id`, `servicio_id`, `fecha`, `hora`, `estado` (pendiente, verificado, cancelado, no-show).
    - `solicitudes`: (Para nuevas reservas vía bot) `id`, `paciente_whatsapp`, `servicio_id` (opcional), `mensaje_consulta` (para consulta previa), `tipo` (turno_nuevo, consulta_previa).
    - `configuracion`: `id`, `nombre_consultorio`, `horarios_atencion` (JSON), `plantillas_mensajes` (JSON).

- **RLS (Row Level Security):** Configurar políticas para que solo el usuario autenticado (la dentista) pueda leer y escribir.

#### Integración con TanStack Start
- Configurar el cliente de Supabase.
- Implementar **Server Functions** en TanStack Start para interactuar con la DB de forma segura.
- Reemplazar `mockData.ts` progresivamente.

#### Criterios de Aceptación (Fase 1):
- [ ] Base de datos en Supabase con tablas creadas y relacionadas.
- [ ] Login funcional que protege el acceso al dashboard.
- [ ] Posibilidad de crear un servicio desde el dashboard y que se persista en Supabase.

---

### Fase 2: Dashboard de Gestión y Ficha del Paciente
Implementación de la lógica central del negocio y la UI administrativa.

#### Ficha del Paciente
- Ficha de paciente simplificada: Datos básicos + Textarea de observaciones + Tabla de historial de turnos. (Sin soporte para archivos/imágenes).
- Lógica de estados: Selector de (Nuevo / Activo / Bloqueado).

#### Solicitudes Pendientes
- Dos vistas separadas (sección `solicitudes`):
    1. **Nuevos Turnos:** Solicitudes de pacientes que enviaron los datos necesarios.
    2. **Consultas Previas:** Mensajes de texto libre donde la dentista debe asignar servicio y horario manualmente (flujo "consulta previa").

#### Plantillas de Mensajes
- CRUD de plantillas de mensajes (Confirmación, Recordatorio, Cancelación) desde la sección de Configuración.

#### Criterios de Aceptación (Fase 2):
- [ ] Se puede ver la lista de pacientes reales de Supabase.
- [ ] Se puede editar el campo "Observaciones" de un paciente y los cambios persisten.
- [ ] La sección de solicitudes muestra correctamente los datos que n8n inserte en la tabla `solicitudes`.

---

### Fase 3: Integración con n8n y Webhooks
Habilitar la comunicación bidireccional para el bot de WhatsApp.

#### API para n8n (TanStack Start API Routes)
- `POST /api/webhooks/n8n-action`: Endpoint que recibirá notificaciones de n8n.
- Implementar la lógica de **Disparadores (Triggers)** en el dashboard: 
    - Al hacer click en "Aprobar Turno", el dashboard envía un POST a la URL de n8n con los datos del turno y la plantilla.

#### Lógica de Auto-Confirmación
- Endpoint o función de servidor que devuelve si un paciente es "Activo" (con turnos previos exitosos) para que el bot de n8n proceda con la auto-confirmación del segundo turno.

#### Criterios de Aceptación (Fase 3):
- [ ] Dashboard envía una petición POST a n8n al aprobar un turno.
- [ ] Existe un endpoint de consulta que n8n puede llamar para verificar el estado de un paciente.

---

### Fase 4: Calendario y Pulido Profesional
Finalización de la agenda visual y validaciones.

#### Calendario
- Visualización de turnos reales de la base de datos.
- Validación de solapamientos (no permitir dos turnos al mismo tiempo).
- Bloqueo de rangos horarios (almuerzo, vacaciones).

#### Criterios de Aceptación (Fase 4):
- [ ] Calendario muestra los turnos reales de Supabase.
- [ ] No se pueden crear turnos que se solapen en el mismo horario.
- [ ] El sistema está listo para que el usuario conecte el flujo de WhatsApp Cloud API externo.
