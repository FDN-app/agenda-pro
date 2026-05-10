import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Paciente = Database['public']['Tables']['pacientes']['Row'];
export type PacienteInsert = Database['public']['Tables']['pacientes']['Insert'];
export type PacienteUpdate = Database['public']['Tables']['pacientes']['Update'];

export type EstadoPaciente = 'todos' | 'nuevo' | 'activo' | 'bloqueado';

export interface ListarPacientesParams {
  busqueda?: string;
  estado?: EstadoPaciente;
  pagina?: number;
  porPagina?: number;
}

export interface ListarPacientesResult {
  pacientes: Paciente[];
  total: number;
  hayMas: boolean;
}

/**
 * Normaliza un número de teléfono a E.164.
 * Elimina caracteres no numéricos excepto el '+'.
 * Si no arranca con '+', asume código de Argentina (+549).
 */
export function normalizarTelefono(input: string): string {
  let cleaned = input.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    // Si no tiene +, le ponemos el +549 por defecto
    cleaned = '+549' + cleaned;
  }
  return cleaned;
}

export async function listarPacientes(params: ListarPacientesParams): Promise<ListarPacientesResult> {
  const { busqueda, estado = 'todos', pagina = 0, porPagina = 50 } = params;

  let query = supabase
    .from('pacientes')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (estado !== 'todos') {
    query = query.eq('estado', estado);
  }

  if (busqueda) {
    const q = busqueda.trim();
    // ilike uses % for wildcards
    query = query.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,telefono.ilike.%${q}%`);
  }

  const from = pagina * porPagina;
  const to = from + porPagina - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error listando pacientes:', error);
    throw new Error('No se pudieron cargar los pacientes.');
  }

  const total = count || 0;
  const hayMas = total > to + 1;

  return {
    pacientes: data as Paciente[],
    total,
    hayMas,
  };
}

export async function obtenerPaciente(id: string): Promise<Paciente | null> {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error('Error al obtener el paciente.');
  }

  return data as Paciente;
}

export async function crearPaciente(data: PacienteInsert): Promise<Paciente> {
  if (data.telefono) {
    data.telefono = normalizarTelefono(data.telefono);
  }

  const { data: result, error } = await supabase
    .from('pacientes')
    .insert(data)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error('Ya existe un paciente con ese teléfono.');
    }
    console.error('Error al crear paciente:', error);
    throw new Error('No se pudo crear el paciente.');
  }

  return result as Paciente;
}

export async function actualizarPaciente(id: string, data: PacienteUpdate): Promise<Paciente> {
  if (data.telefono) {
    data.telefono = normalizarTelefono(data.telefono);
  }

  const { data: result, error } = await supabase
    .from('pacientes')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe un paciente con ese teléfono.');
    }
    console.error('Error al actualizar paciente:', error);
    throw new Error('No se pudo actualizar el paciente.');
  }

  return result as Paciente;
}

export async function eliminarPaciente(id: string): Promise<void> {
  const { error } = await supabase
    .from('pacientes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar paciente:', error);
    throw new Error('No se pudo eliminar el paciente.');
  }
}

export async function actualizarObservaciones(id: string, observaciones: string): Promise<Paciente> {
  const { data: result, error } = await supabase
    .from('pacientes')
    .update({ observaciones: observaciones || null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar observaciones:', error);
    throw new Error('No se pudieron actualizar las observaciones.');
  }

  return result as Paciente;
}
