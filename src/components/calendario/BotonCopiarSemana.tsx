import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCopiarDisponibilidadesDeSemana } from "@/hooks/useDisponibilidades";

interface BotonCopiarSemanaProps {
  semanaActualInicio: Date;
  cantidadActual: number;
}

export function BotonCopiarSemana({ semanaActualInicio, cantidadActual }: BotonCopiarSemanaProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const copiarMutation = useCopiarDisponibilidadesDeSemana();

  const handleCopiar = (modo: 'reemplazar' | 'agregar') => {
    const semanaOrigenInicio = new Date(semanaActualInicio);
    semanaOrigenInicio.setDate(semanaOrigenInicio.getDate() - 7);
    
    copiarMutation.mutate(
      {
        semanaOrigenInicio,
        semanaDestinoInicio: semanaActualInicio,
        modo
      },
      {
        onSuccess: () => {
          setModalOpen(false);
        }
      }
    );
  };

  const handleBotonClick = () => {
    if (cantidadActual === 0) {
      // Copia directa reemplazando la semana vacía
      handleCopiar('reemplazar');
    } else {
      // Hay franjas, preguntar qué hacer
      setModalOpen(true);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleBotonClick}
        disabled={copiarMutation.isPending}
        className="hidden sm:flex" // Podríamos mostrarlo en mobile también, pero veamos si entra
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar semana pasada
      </Button>
      
      {/* Botón solo icono para mobile */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleBotonClick}
        disabled={copiarMutation.isPending}
        className="flex sm:hidden"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>Copiar disponibilidades</DialogTitle>
            <div className="text-sm text-muted-foreground mt-2">
              Esta semana ya tiene {cantidadActual} franja{cantidadActual > 1 ? 's' : ''} cargada{cantidadActual > 1 ? 's' : ''}. ¿Qué querés hacer?
            </div>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setModalOpen(false)}
              disabled={copiarMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => handleCopiar('agregar')}
              disabled={copiarMutation.isPending}
              className="w-full sm:w-auto"
            >
              Agregar a las actuales
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => handleCopiar('reemplazar')}
              disabled={copiarMutation.isPending}
              className="w-full sm:w-auto"
            >
              Reemplazar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
