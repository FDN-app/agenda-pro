import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  actualizarObservaciones,
  eliminarPaciente,
  type ListarPacientesParams,
  type PacienteInsert,
  type PacienteUpdate
} from '@/lib/api/pacientes';

export function usePacientesList(params: Omit<ListarPacientesParams, 'pagina'>) {
  return useInfiniteQuery({
    queryKey: ['pacientes', 'list', params],
    queryFn: ({ pageParam = 0 }) => listarPacientes({ ...params, pagina: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hayMas ? allPages.length : undefined;
    },
  });
}

export function usePaciente(id: string | null) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: () => (id ? obtenerPaciente(id) : null),
    enabled: !!id,
  });
}

export function useCrearPaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PacienteInsert) => crearPaciente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

export function useActualizarPaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PacienteUpdate }) => actualizarPaciente(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['paciente', variables.id] });
    },
  });
}

export function useEliminarPaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarPaciente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

export function useActualizarObservaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observaciones }: { id: string; observaciones: string }) =>
      actualizarObservaciones(id, observaciones),
    onSuccess: (paciente) => {
      // Actualizar el cache del paciente individual
      queryClient.setQueryData(['paciente', paciente.id], paciente);
      // Invalidar listado para que refleje cambios si están visibles
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Observaciones guardadas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar observaciones');
    },
  });
}
