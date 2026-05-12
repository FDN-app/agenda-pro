import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type DisponibilidadRow = Database['public']['Tables']['disponibilidades']['Row'];
export type DisponibilidadInsert = Database['public']['Tables']['disponibilidades']['Insert'];
export type DisponibilidadUpdate = Database['public']['Tables']['disponibilidades']['Update'];

export interface Disponibilidad {
  id: string;
  inicio_at: Date;
  fin_at: Date;
  notas: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

function deserializarDisponibilidad(row: DisponibilidadRow): Disponibilidad {
  return {
    ...row,
    inicio_at: new Date(row.inicio_at),
    fin_at: new Date(row.fin_at),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
  };
}

export async function listarDisponibilidadesPorRango(desde: Date, hasta: Date): Promise<Disponibilidad[]> {
  const { data, error } = await supabase
    .from('disponibilidades')
    .select('*')
    .is('deleted_at', null)
    .gte('inicio_at', desde.toISOString())
    .lt('inicio_at', hasta.toISOString())
    .order('inicio_at', { ascending: true });

  if (error) {
    console.error('Error listando disponibilidades:', error);
    throw new Error('No se pudieron cargar las disponibilidades.');
  }

  return (data as DisponibilidadRow[]).map(deserializarDisponibilidad);
}

export async function crearDisponibilidad(input: { inicio_at: Date; fin_at: Date; notas?: string | null }): Promise<Disponibilidad> {
  const { data, error } = await supabase
    .from('disponibilidades')
    .insert({
      inicio_at: input.inicio_at.toISOString(),
      fin_at: input.fin_at.toISOString(),
      notas: input.notas || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear disponibilidad:', error);
    throw new Error('No se pudo crear la disponibilidad.');
  }

  return deserializarDisponibilidad(data as DisponibilidadRow);
}

export async function actualizarDisponibilidad(
  id: string, 
  cambios: Partial<{ inicio_at: Date; fin_at: Date; notas: string | null }>
): Promise<Disponibilidad> {
  
  const updateData: any = {};
  if (cambios.inicio_at) updateData.inicio_at = cambios.inicio_at.toISOString();
  if (cambios.fin_at) updateData.fin_at = cambios.fin_at.toISOString();
  if (cambios.notas !== undefined) updateData.notas = cambios.notas;

  const { data, error } = await supabase
    .from('disponibilidades')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar disponibilidad:', error);
    throw new Error('No se pudo actualizar la disponibilidad.');
  }

  return deserializarDisponibilidad(data as DisponibilidadRow);
}

export async function eliminarDisponibilidad(id: string): Promise<void> {
  const { error } = await supabase
    .from('disponibilidades')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar disponibilidad:', error);
    throw new Error('No se pudo eliminar la disponibilidad.');
  }
}

export async function copiarDisponibilidadesDeSemana(opciones: { 
  semanaOrigenInicio: Date; 
  semanaDestinoInicio: Date; 
  modo: 'reemplazar' | 'agregar' 
}): Promise<{ creadas: number; eliminadas: number }> {
  const { semanaOrigenInicio, semanaDestinoInicio, modo } = opciones;

  // 1. Obtener origen
  const semanaOrigenFin = new Date(semanaOrigenInicio);
  semanaOrigenFin.setDate(semanaOrigenFin.getDate() + 7);
  const origen = await listarDisponibilidadesPorRango(semanaOrigenInicio, semanaOrigenFin);

  if (origen.length === 0) return { creadas: 0, eliminadas: 0 };

  // 2. Obtener destino
  const semanaDestinoFin = new Date(semanaDestinoInicio);
  semanaDestinoFin.setDate(semanaDestinoFin.getDate() + 7);
  const destino = await listarDisponibilidadesPorRango(semanaDestinoInicio, semanaDestinoFin);

  let eliminadas = 0;

  // 3. Procesar modo reemplazar
  if (modo === 'reemplazar' && destino.length > 0) {
    const ids = destino.map(d => d.id);
    const { error: deleteError } = await supabase
      .from('disponibilidades')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids);
      
    if (deleteError) {
      console.error('Error en soft delete masivo:', deleteError);
      throw new Error('Error al limpiar la semana destino.');
    }
    eliminadas = ids.length;
  }

  // 4. Calcular desplazamiento de fechas (preservando horas locales via diff de días)
  const diffDays = Math.round((semanaDestinoInicio.getTime() - semanaOrigenInicio.getTime()) / (1000 * 60 * 60 * 24));

  const nuevasAInsertar = origen.map(d => {
    const nInicio = new Date(d.inicio_at); // d.inicio_at is Date!
    nInicio.setDate(nInicio.getDate() + diffDays);
    
    const nFin = new Date(d.fin_at); // d.fin_at is Date!
    nFin.setDate(nFin.getDate() + diffDays);
    
    return {
      inicio_at: nInicio.toISOString(),
      fin_at: nFin.toISOString(),
      notas: d.notas
    };
  });

  // 5. Filtrar duplicados exactos si es agregar
  let finales = nuevasAInsertar;
  if (modo === 'agregar') {
    finales = nuevasAInsertar.filter(nueva => {
      // Buscar coincidencia exacta en destino (mismo inicio y fin)
      return !destino.some(existente => 
        existente.inicio_at.toISOString() === nueva.inicio_at && existente.fin_at.toISOString() === nueva.fin_at
      );
    });
  }

  if (finales.length === 0) return { creadas: 0, eliminadas };

  // 6. Insertar
  const { error: insertError } = await supabase
    .from('disponibilidades')
    .insert(finales);

  if (insertError) {
    console.error('Error insertando copias:', insertError);
    throw new Error('Error al insertar disponibilidades copiadas.');
  }

  return { creadas: finales.length, eliminadas };
}
