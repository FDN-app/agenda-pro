import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarDisponibilidadesPorRango,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad,
  copiarDisponibilidadesDeSemana
} from '@/lib/api/disponibilidades';

export function useDisponibilidadesPorRango(desde: Date, hasta: Date) {
  return useQuery({
    queryKey: ['disponibilidades', desde.toISOString(), hasta.toISOString()],
    queryFn: () => listarDisponibilidadesPorRango(desde, hasta),
    staleTime: 1000 * 60, // 1 minuto
  });
}

export function useCrearDisponibilidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { inicio_at: Date; fin_at: Date; notas?: string | null }) => crearDisponibilidad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
      toast.success('Disponibilidad creada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la disponibilidad');
    }
  });
}

export function useActualizarDisponibilidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: Partial<{ inicio_at: Date; fin_at: Date; notas: string | null }> }) => 
      actualizarDisponibilidad(id, cambios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
      toast.success('Disponibilidad actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar la disponibilidad');
    }
  });
}

export function useEliminarDisponibilidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarDisponibilidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
      toast.success('Disponibilidad eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar la disponibilidad');
    }
  });
}

export function useCopiarDisponibilidadesDeSemana() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opciones: { semanaOrigenInicio: Date; semanaDestinoInicio: Date; modo: 'reemplazar' | 'agregar' }) => 
      copiarDisponibilidadesDeSemana(opciones),
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
      if (resultado.creadas === 0) {
        toast.info('No se copiaron franjas (ya existían o la semana de origen estaba vacía)');
      } else {
        toast.success(`Se copiaron ${resultado.creadas} franjas de disponibilidad`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al copiar las disponibilidades');
    }
  });
}
