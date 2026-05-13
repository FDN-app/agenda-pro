import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarTurnosPorRango,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  cambiarEstadoTurno,
  type EstadoTurno,
} from '@/lib/api/turnos';

export function useTurnosPorRango(desde: Date, hasta: Date) {
  return useQuery({
    queryKey: ['turnos', desde.toISOString(), hasta.toISOString()],
    queryFn: () => listarTurnosPorRango(desde, hasta),
    staleTime: 1000 * 60, // 1 minuto
  });
}

export function useCrearTurno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      paciente_id: string;
      servicio_id: string | null;
      inicio_at: Date;
      fin_at: Date;
      notas?: string | null;
      estado?: EstadoTurno;
    }) => crearTurno(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno creado con éxito');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el turno');
    },
  });
}

export function useActualizarTurno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cambios }: {
      id: string;
      cambios: Partial<{
        paciente_id: string;
        servicio_id: string | null;
        inicio_at: Date;
        fin_at: Date;
        notas: string | null;
        estado: EstadoTurno;
      }>;
    }) => actualizarTurno(id, cambios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el turno');
    },
  });
}

export function useEliminarTurno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el turno');
    },
  });
}

export function useCambiarEstadoTurno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoTurno }) =>
      cambiarEstadoTurno(id, estado),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      const labels: Record<EstadoTurno, string> = {
        programado: 'Turno marcado como programado',
        confirmado: 'Turno confirmado',
        cumplido: 'Turno marcado como cumplido',
        cancelado: 'Turno cancelado',
        ausente: 'Paciente marcado como ausente',
      };
      toast.success(labels[variables.estado]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cambiar el estado del turno');
    },
  });
}
