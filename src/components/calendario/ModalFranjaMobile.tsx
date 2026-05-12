import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { franjasHorarias, formatoDiaCorto, MINUTOS_SLOT } from "@/lib/calendario/utils";

interface ModalFranjaMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dia: Date | null;
  initialInicioMinutos?: number | null;
  initialFinMinutos?: number | null;
  franjaId?: string | null;
  onGuardar: (inicio: number, fin: number) => void;
  onEliminar?: () => void;
  isSaving?: boolean;
}

export function ModalFranjaMobile({
  open,
  onOpenChange,
  dia,
  initialInicioMinutos,
  initialFinMinutos,
  franjaId,
  onGuardar,
  onEliminar,
  isSaving
}: ModalFranjaMobileProps) {
  const [inicioStr, setInicioStr] = useState<string>("");
  const [finStr, setFinStr] = useState<string>("");
  const franjas = franjasHorarias();

  // Resetear el estado al abrir
  useEffect(() => {
    if (open) {
      if (initialInicioMinutos) {
        setInicioStr(initialInicioMinutos.toString());
      } else {
        // Por defecto 09:00 (540 minutos)
        setInicioStr("540");
      }

      if (initialFinMinutos) {
        setFinStr(initialFinMinutos.toString());
      } else {
        // Por defecto 09:15
        setFinStr("555");
      }
    }
  }, [open, initialInicioMinutos, initialFinMinutos]);

  const opcionesInicio = franjas.slice(0, -1); // Hasta 20:45
  
  // Opciones de fin: dependen de la hora de inicio seleccionada
  const inicioVal = parseInt(inicioStr) || 0;
  const opcionesFin = franjas.filter(f => f.minutos > inicioVal);

  const handleGuardar = () => {
    onGuardar(parseInt(inicioStr), parseInt(finStr));
  };

  const isEditar = !!franjaId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[90vw] rounded-xl">
        <DialogHeader>
          <DialogTitle>{isEditar ? "Editar disponibilidad" : "Nueva disponibilidad"}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {dia ? formatoDiaCorto(dia) : ""}
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Hora Inicio</label>
              <Select 
                value={inicioStr} 
                onValueChange={(val) => {
                  setInicioStr(val);
                  // Auto ajustar fin si queda inconsistente
                  if (parseInt(finStr) <= parseInt(val)) {
                    setFinStr((parseInt(val) + MINUTOS_SLOT).toString());
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona inicio" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesInicio.map(f => (
                    <SelectItem key={`inicio-${f.minutos}`} value={f.minutos.toString()}>
                      {f.hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Hora Fin</label>
              <Select value={finStr} onValueChange={setFinStr}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fin" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesFin.map(f => (
                    <SelectItem key={`fin-${f.minutos}`} value={f.minutos.toString()}>
                      {f.hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          {isEditar && onEliminar && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onEliminar}
              disabled={isSaving}
              className="sm:mr-auto w-full sm:w-auto"
            >
              Eliminar franja
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleGuardar}
              disabled={isSaving || !inicioStr || !finStr}
              className="flex-1 sm:flex-none"
            >
              {isEditar ? "Guardar" : "Crear"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
