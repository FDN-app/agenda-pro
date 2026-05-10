import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  alternarActivoServicio,
  eliminarServicio,
  type ServicioInsert,
  type ServicioUpdate
} from '@/lib/api/servicios';

export function useServiciosList() {
  return useQuery({
    queryKey: ['servicios'],
    queryFn: listarServicios,
  });
}

export function useServicio(id: string | null) {
  return useQuery({
    queryKey: ['servicio', id],
    queryFn: () => (id ? obtenerServicio(id) : null),
    enabled: !!id,
  });
}

export function useCrearServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServicioInsert) => crearServicio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      toast.success('Servicio creado con éxito');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el servicio');
    },
  });
}

export function useActualizarServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServicioUpdate }) => actualizarServicio(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['servicio', variables.id] });
      toast.success('Servicio actualizado con éxito');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el servicio');
    },
  });
}

export function useAlternarActivoServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => alternarActivoServicio(id, activo),
    onSuccess: (servicio) => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.setQueryData(['servicio', servicio.id], servicio);
      toast.success(servicio.activo ? 'Servicio activado' : 'Servicio desactivado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cambiar estado del servicio');
    },
  });
}

export function useEliminarServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarServicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      toast.success('Servicio eliminado con éxito');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el servicio');
    },
  });
}
