import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HORA_INICIO, HORA_FIN, MINUTOS_SLOT } from "@/lib/calendario/utils";
import type { DragAction } from "@/hooks/useDragFranja";

interface FranjaDisponibilidadProps {
  id: string;
  inicio_minutos: number;
  fin_minutos: number;
  isMobile: boolean;
  isGhost?: boolean;
  ghostAction?: DragAction;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void; // Para mobile
  onResizeStart?: (e: React.PointerEvent, id: string, startMin: number, endMin: number) => void;
  onClickParaTurno?: (minutosDelClic: number) => void; // Desktop: clic para crear turno
  isSaving?: boolean;
}

export function getFranjaStyles(inicioMinutos: number, finMinutos: number) {
  const TOTAL_MINUTES = (HORA_FIN - HORA_INICIO) * 60 + MINUTOS_SLOT;
  const topPercentage = ((inicioMinutos - (HORA_INICIO * 60)) / TOTAL_MINUTES) * 100;
  const heightPercentage = ((finMinutos - inicioMinutos) / TOTAL_MINUTES) * 100;
  
  return {
    top: `${topPercentage}%`,
    height: `${heightPercentage}%`,
  };
}

export function FranjaDisponibilidad({
  id,
  inicio_minutos,
  fin_minutos,
  isMobile,
  isGhost,
  ghostAction,
  onDelete,
  onEdit,
  onResizeStart,
  onClickParaTurno,
  isSaving
}: FranjaDisponibilidadProps) {
  // Desktop: clic en el cuerpo de la franja = crear turno en esa posición
  const handleFranjaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || isGhost || !onClickParaTurno) return;
    // Calcular minutos desde la posición Y del clic dentro de la franja
    const rect = e.currentTarget.getBoundingClientRect();
    const yRelativo = e.clientY - rect.top;
    const fraccion = yRelativo / rect.height;
    const duracionFranja = fin_minutos - inicio_minutos;
    const minutosDelClic = inicio_minutos + Math.floor((fraccion * duracionFranja) / 15) * 15;
    e.stopPropagation();
    onClickParaTurno(minutosDelClic);
  };
  return (
    <div
      className={cn(
        "absolute left-1 right-1 sm:left-2 sm:right-2 rounded-md overflow-hidden z-20",
        isGhost 
          ? "bg-primary/20 border-2 border-dashed border-primary/50 opacity-80 pointer-events-none" 
          : "bg-primary/15 border border-primary/40 group transition-all",
        isSaving && "opacity-50 pointer-events-none",
        isMobile && !isGhost ? "cursor-pointer" : ""
      )}
      style={getFranjaStyles(inicio_minutos, fin_minutos)}
      onClick={(e) => {
        if (isMobile && !isGhost && onEdit) {
          onEdit(id);
        } else if (!isMobile && !isGhost) {
          handleFranjaClick(e);
        }
      }}
    >
      {/* Botón Eliminar (solo desktop hover) */}
      {!isMobile && !isGhost && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive text-primary/70 bg-background/50 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          aria-label="Eliminar franja"
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Handle de resize (borde inferior) */}
      {!isMobile && !isGhost && onResizeStart && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => {
            onResizeStart(e, id, inicio_minutos, fin_minutos);
          }}
        >
          <div className="w-4 h-1 bg-primary/60 rounded-full" />
        </div>
      )}
    </div>
  );
}
