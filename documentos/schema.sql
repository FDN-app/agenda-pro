-- Script inicial para la Base de Datos - Agenda Pro (Fase 1) - Revisado con roles, soft delete y auditoría

-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Tablas
-- ==========================================

-- Tabla: perfiles
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla: pacientes
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL UNIQUE,
  dni TEXT,
  obra_social TEXT,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'activo', 'bloqueado')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ NULL
);

-- Tabla: servicios
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  duracion_min INTEGER NOT NULL,
  color TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ NULL
);

-- Tabla: turnos
CREATE TABLE public.turnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  servicio_id UUID REFERENCES public.servicios(id) ON DELETE RESTRICT,
  inicio_at TIMESTAMPTZ NOT NULL,
  fin_at TIMESTAMPTZ NOT NULL,
  notas TEXT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'verificado', 'cancelado', 'no-show')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ NULL,
  CHECK (fin_at > inicio_at)
);

-- Tabla: solicitudes
CREATE TABLE public.solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telefono TEXT NOT NULL,
  paciente_id UUID NULL REFERENCES public.pacientes(id) ON DELETE SET NULL,
  servicio_id UUID REFERENCES public.servicios(id) ON DELETE SET NULL,
  mensaje_consulta TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('turno_nuevo', 'consulta_previa')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'descartada')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla: configuracion
CREATE TABLE public.configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_consultorio TEXT NOT NULL DEFAULT 'Agenda Pro',
  horarios_atencion JSONB DEFAULT '[]'::jsonb,
  plantillas_mensajes JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==========================================
-- 2. Funciones y Triggers (updated_at)
-- ==========================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_perfiles BEFORE UPDATE ON public.perfiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_pacientes BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_servicios BEFORE UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_turnos BEFORE UPDATE ON public.turnos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_solicitudes BEFORE UPDATE ON public.solicitudes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_configuracion BEFORE UPDATE ON public.configuracion FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 3. Índices
-- ==========================================

CREATE INDEX idx_turnos_inicio_at ON public.turnos(inicio_at);
CREATE INDEX idx_turnos_paciente_id ON public.turnos(paciente_id);
CREATE INDEX idx_turnos_estado ON public.turnos(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_solicitudes_estado ON public.solicitudes(estado);
CREATE INDEX idx_pacientes_estado ON public.pacientes(estado) WHERE deleted_at IS NULL;

-- ==========================================
-- 4. Seguridad (Roles y RLS)
-- ==========================================

-- Función Helper para validar si el usuario es Admin
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas: perfiles
CREATE POLICY "perfiles_select_self" ON public.perfiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "perfiles_update_admin" ON public.perfiles FOR UPDATE TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "perfiles_insert_admin" ON public.perfiles FOR INSERT TO authenticated WITH CHECK (public.es_admin());
CREATE POLICY "perfiles_delete_admin" ON public.perfiles FOR DELETE TO authenticated USING (public.es_admin());

-- Políticas: pacientes
CREATE POLICY "pacientes_select_auth" ON public.pacientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "pacientes_insert_auth" ON public.pacientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pacientes_update_auth" ON public.pacientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pacientes_delete_admin" ON public.pacientes FOR DELETE TO authenticated USING (public.es_admin());

-- Políticas: servicios
CREATE POLICY "servicios_select_auth" ON public.servicios FOR SELECT TO authenticated USING (true);
CREATE POLICY "servicios_insert_auth" ON public.servicios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "servicios_update_auth" ON public.servicios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "servicios_delete_admin" ON public.servicios FOR DELETE TO authenticated USING (public.es_admin());

-- Políticas: turnos
CREATE POLICY "turnos_select_auth" ON public.turnos FOR SELECT TO authenticated USING (true);
CREATE POLICY "turnos_insert_auth" ON public.turnos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "turnos_update_auth" ON public.turnos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "turnos_delete_admin" ON public.turnos FOR DELETE TO authenticated USING (public.es_admin());

-- Políticas: solicitudes
CREATE POLICY "solicitudes_select_auth" ON public.solicitudes FOR SELECT TO authenticated USING (true);
CREATE POLICY "solicitudes_insert_auth" ON public.solicitudes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "solicitudes_update_auth" ON public.solicitudes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "solicitudes_delete_admin" ON public.solicitudes FOR DELETE TO authenticated USING (public.es_admin());

-- Políticas: configuracion
CREATE POLICY "configuracion_select_auth" ON public.configuracion FOR SELECT TO authenticated USING (true);
CREATE POLICY "configuracion_insert_admin" ON public.configuracion FOR INSERT TO authenticated WITH CHECK (public.es_admin());
CREATE POLICY "configuracion_update_admin" ON public.configuracion FOR UPDATE TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "configuracion_delete_admin" ON public.configuracion FOR DELETE TO authenticated USING (public.es_admin());

-- ==========================================
-- 5. Seed Inicial
-- ==========================================

INSERT INTO public.configuracion (nombre_consultorio, horarios_atencion, plantillas_mensajes)
VALUES (
  'Agenda Pro',
  '[{"dia": "Lunes", "inicio": "09:00", "fin": "18:00", "activo": true}, {"dia": "Martes", "inicio": "09:00", "fin": "18:00", "activo": true}, {"dia": "Miercoles", "inicio": "09:00", "fin": "18:00", "activo": true}, {"dia": "Jueves", "inicio": "09:00", "fin": "18:00", "activo": true}, {"dia": "Viernes", "inicio": "09:00", "fin": "18:00", "activo": true}]'::jsonb,
  '{"confirmacion": "Hola {{nombre}}, tu turno para {{servicio}} el {{fecha}} a las {{hora}} está confirmado.", "recordatorio": "Hola {{nombre}}, te recordamos tu turno mañana a las {{hora}}."}'::jsonb
);

-- ==========================================
-- 6. Fase 4: Disponibilidades
-- ==========================================

-- Tabla: disponibilidades
CREATE TABLE IF NOT EXISTS public.disponibilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inicio_at TIMESTAMPTZ NOT NULL,
  fin_at TIMESTAMPTZ NOT NULL,
  notas TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ NULL,
  CHECK (fin_at > inicio_at)
);

-- Trigger (Idempotente vía DROP previo)
DROP TRIGGER IF EXISTS set_updated_at_disponibilidades ON public.disponibilidades;
CREATE TRIGGER set_updated_at_disponibilidades 
BEFORE UPDATE ON public.disponibilidades 
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_disponibilidades_inicio_at ON public.disponibilidades(inicio_at);
CREATE INDEX IF NOT EXISTS idx_disponibilidades_activos ON public.disponibilidades(inicio_at) WHERE deleted_at IS NULL;

-- Seguridad y RLS
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;

-- Políticas (Idempotentes)
DROP POLICY IF EXISTS "disponibilidades_select_auth" ON public.disponibilidades;
CREATE POLICY "disponibilidades_select_auth" ON public.disponibilidades FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "disponibilidades_insert_admin" ON public.disponibilidades;
CREATE POLICY "disponibilidades_insert_admin" ON public.disponibilidades FOR INSERT TO authenticated WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS "disponibilidades_update_admin" ON public.disponibilidades;
CREATE POLICY "disponibilidades_update_admin" ON public.disponibilidades FOR UPDATE TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS "disponibilidades_delete_admin" ON public.disponibilidades;
CREATE POLICY "disponibilidades_delete_admin" ON public.disponibilidades FOR DELETE TO authenticated USING (public.es_admin());
