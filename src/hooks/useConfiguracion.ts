import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  obtenerConfiguracion,
  actualizarConfiguracion,
  type ConfiguracionUpdate
} from '@/lib/api/configuracion';

export function useConfiguracion() {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: obtenerConfiguracion,
  });
}

export function useActualizarConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfiguracionUpdate }) =>
      actualizarConfiguracion(id, data),
    onSuccess: (updatedConf) => {
      queryClient.setQueryData(['configuracion'], updatedConf);
      toast.success('Configuración guardada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar la configuración');
    },
  });
}
