import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Configuracion = Database['public']['Tables']['configuracion']['Row'];
export type ConfiguracionUpdate = Database['public']['Tables']['configuracion']['Update'];

export async function obtenerConfiguracion(): Promise<Configuracion | null> {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error al obtener la configuración:', error);
    throw new Error('No se pudo cargar la configuración del consultorio.');
  }

  return data as Configuracion | null;
}

export async function actualizarConfiguracion(id: string, data: ConfiguracionUpdate): Promise<Configuracion> {
  const { data: result, error } = await supabase
    .from('configuracion')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar configuración:', error);
    if (error.code === '42501' || error.message.includes('RLS')) {
      throw new Error('Solo el administrador puede modificar la configuración.');
    }
    throw new Error('No se pudo guardar la configuración.');
  }

  return result as Configuracion;
}
