import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatoRangoSemana, finDeSemana } from "@/lib/calendario/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarioHeaderProps {
  inicioSemana: Date;
  onCambiarSemana: (nuevoInicio: Date) => void;
  onCrearTurno: () => void;
}

export function CalendarioHeader({ inicioSemana, onCambiarSemana, onCrearTurno }: CalendarioHeaderProps) {
  const finSemana = finDeSemana(inicioSemana);
  const rangoTexto = formatoRangoSemana(inicioSemana, finSemana);
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
      <div>
        <p className="text-sm text-muted-foreground">Tu agenda</p>
        <h1 className="text-3xl font-semibold">Calendario</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Navegación */}
        <div className="flex items-center justify-between bg-card border border-border rounded-lg p-1 w-full sm:w-auto shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 shrink-0" 
            onClick={() => onCambiarSemana(new Date(inicioSemana.getTime() - 7 * 24 * 60 * 60 * 1000))}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          
          <div className="px-3 py-1 flex-1 text-center sm:min-w-[200px]">
            <span className="text-sm font-medium">{rangoTexto}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 shrink-0"
            onClick={() => onCambiarSemana(new Date(inicioSemana.getTime() + 7 * 24 * 60 * 60 * 1000))}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none h-10"
            onClick={() => onCambiarSemana(new Date())}
          >
            Hoy
          </Button>
          <Button 
            onClick={onCrearTurno} 
            className="flex-1 sm:flex-none h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="size-4" />
            <span className={isMobile ? "" : "whitespace-nowrap"}>Nuevo turno</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
