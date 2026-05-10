import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Servicio = Database['public']['Tables']['servicios']['Row'];
export type ServicioInsert = Database['public']['Tables']['servicios']['Insert'];
export type ServicioUpdate = Database['public']['Tables']['servicios']['Update'];

export async function listarServicios(): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .is('deleted_at', null)
    .order('activo', { ascending: false })
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al listar servicios:', error);
    throw new Error('No se pudieron cargar los servicios.');
  }

  return data as Servicio[];
}

export async function obtenerServicio(id: string): Promise<Servicio | null> {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error al obtener servicio:', error);
    throw new Error('No se pudo obtener el servicio.');
  }

  return data as Servicio | null;
}

export async function crearServicio(data: ServicioInsert): Promise<Servicio> {
  const { data: result, error } = await supabase
    .from('servicios')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error al crear servicio:', error);
    if (error.code === '23505') {
      throw new Error('Ya existe un servicio con ese nombre.');
    }
    throw new Error('No se pudo crear el servicio.');
  }

  return result as Servicio;
}

export async function actualizarServicio(id: string, data: ServicioUpdate): Promise<Servicio> {
  const { data: result, error } = await supabase
    .from('servicios')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar servicio:', error);
    if (error.code === '23505') {
      throw new Error('Ya existe un servicio con ese nombre.');
    }
    throw new Error('No se pudo actualizar el servicio.');
  }

  return result as Servicio;
}

export async function alternarActivoServicio(id: string, activo: boolean): Promise<Servicio> {
  const { data: result, error } = await supabase
    .from('servicios')
    .update({ activo })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al cambiar estado del servicio:', error);
    throw new Error('No se pudo cambiar el estado del servicio.');
  }

  return result as Servicio;
}

export async function eliminarServicio(id: string): Promise<void> {
  const { error } = await supabase
    .from('servicios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar servicio:', error);
    throw new Error('No se pudo eliminar el servicio.');
  }
}
