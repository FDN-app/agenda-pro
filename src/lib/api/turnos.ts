import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

// ---------- Tipos ----------

type TurnoRow = Database['public']['Tables']['turnos']['Row'];

export const ESTADOS_TURNO = [
  'programado', 'confirmado', 'cumplido', 'cancelado', 'ausente'
] as const;

export type EstadoTurno = typeof ESTADOS_TURNO[number];

export interface Turno {
  id: string;
  paciente_id: string;
  servicio_id: string | null;
  inicio_at: Date;
  fin_at: Date;
  notas: string | null;
  estado: EstadoTurno;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  // Joins opcionales (cuando la query los trae)
  paciente?: { id: string; nombre: string; apellido: string; telefono: string };
  servicio?: { id: string; nombre: string; color: string | null; duracion_min: number } | null;
}

// Select con joins para reutilizar en todas las queries
const SELECT_CON_JOINS = `
  *,
  paciente:pacientes!turnos_paciente_id_fkey(id, nombre, apellido, telefono),
  servicio:servicios!turnos_servicio_id_fkey(id, nombre, color, duracion_min)
`;

// ---------- Deserialización (frontera API → UI) ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializarTurno(row: any): Turno {
  return {
    id: row.id,
    paciente_id: row.paciente_id,
    servicio_id: row.servicio_id,
    inicio_at: new Date(row.inicio_at),
    fin_at: new Date(row.fin_at),
    notas: row.notas,
    estado: row.estado as EstadoTurno,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
    // Joins (si vienen)
    paciente: row.paciente || undefined,
    servicio: row.servicio ?? undefined,
  };
}

// ---------- Queries ----------

export async function listarTurnosPorRango(desde: Date, hasta: Date): Promise<Turno[]> {
  const { data, error } = await supabase
    .from('turnos')
    .select(SELECT_CON_JOINS)
    .is('deleted_at', null)
    .gte('inicio_at', desde.toISOString())
    .lt('inicio_at', hasta.toISOString())
    .order('inicio_at', { ascending: true });

  if (error) {
    console.error('Error listando turnos:', error);
    throw new Error('No se pudieron cargar los turnos.');
  }

  return (data ?? []).map(deserializarTurno);
}

// ---------- Mutaciones ----------

export async function crearTurno(input: {
  paciente_id: string;
  servicio_id: string | null;
  inicio_at: Date;
  fin_at: Date;
  notas?: string | null;
  estado?: EstadoTurno;
}): Promise<Turno> {
  const { data, error } = await supabase
    .from('turnos')
    .insert({
      paciente_id: input.paciente_id,
      servicio_id: input.servicio_id || null,
      inicio_at: input.inicio_at.toISOString(),
      fin_at: input.fin_at.toISOString(),
      notas: input.notas || null,
      estado: input.estado || 'programado',
    })
    .select(SELECT_CON_JOINS)
    .single();

  if (error) {
    console.error('Error al crear turno:', error);
    throw new Error('No se pudo crear el turno.');
  }

  return deserializarTurno(data);
}

export async function actualizarTurno(
  id: string,
  cambios: Partial<{
    paciente_id: string;
    servicio_id: string | null;
    inicio_at: Date;
    fin_at: Date;
    notas: string | null;
    estado: EstadoTurno;
  }>
): Promise<Turno> {
  // Serializar fechas si vienen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (cambios.paciente_id !== undefined) updateData.paciente_id = cambios.paciente_id;
  if (cambios.servicio_id !== undefined) updateData.servicio_id = cambios.servicio_id;
  if (cambios.inicio_at) updateData.inicio_at = cambios.inicio_at.toISOString();
  if (cambios.fin_at) updateData.fin_at = cambios.fin_at.toISOString();
  if (cambios.notas !== undefined) updateData.notas = cambios.notas;
  if (cambios.estado !== undefined) updateData.estado = cambios.estado;

  const { data, error } = await supabase
    .from('turnos')
    .update(updateData)
    .eq('id', id)
    .select(SELECT_CON_JOINS)
    .single();

  if (error) {
    console.error('Error al actualizar turno:', error);
    throw new Error('No se pudo actualizar el turno.');
  }

  return deserializarTurno(data);
}

export async function eliminarTurno(id: string): Promise<void> {
  const { error } = await supabase
    .from('turnos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar turno:', error);
    throw new Error('No se pudo eliminar el turno.');
  }
}

export async function cambiarEstadoTurno(id: string, estado: EstadoTurno): Promise<Turno> {
  const { data, error } = await supabase
    .from('turnos')
    .update({ estado })
    .eq('id', id)
    .select(SELECT_CON_JOINS)
    .single();

  if (error) {
    console.error('Error al cambiar estado del turno:', error);
    throw new Error('No se pudo cambiar el estado del turno.');
  }

  return deserializarTurno(data);
}

// ---------- Helpers de validación ----------

/**
 * Verifica si un rango [inicio, fin) se solapa con algún turno existente.
 * Excluye turnos cancelados y opcionalmente un turno por ID (para edición).
 */
export function tieneOverlapTurnos(
  turnos: Turno[],
  inicio: Date,
  fin: Date,
  excluirId?: string
): boolean {
  return turnos.some(t => {
    if (t.id === excluirId) return false;
    if (t.estado === 'cancelado' || t.estado === 'ausente') return false;
    // Overlap: inicio < t.fin && fin > t.inicio
    return inicio < t.fin_at && fin > t.inicio_at;
  });
}

/**
 * Verifica si un rango [inicio, fin) cae completamente dentro de al menos
 * una franja de disponibilidad. Si no hay disponibilidades definidas,
 * retorna true (no hay restricción).
 */
export function estaDentroDeDisponibilidad(
  disponibilidades: { inicio_at: Date; fin_at: Date }[],
  inicio: Date,
  fin: Date
): boolean {
  if (disponibilidades.length === 0) return true;

  return disponibilidades.some(d =>
    inicio >= d.inicio_at && fin <= d.fin_at
  );
}
