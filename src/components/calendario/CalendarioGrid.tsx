import { useMemo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  diasDeSemana, 
  franjasHorarias, 
  formatoDiaCorto, 
  mismoDia 
} from "@/lib/calendario/utils";
import { IndicadorHoraActual } from "./IndicadorHoraActual";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Disponibilidad } from "@/lib/api/disponibilidades";
import { useCrearDisponibilidad, useActualizarDisponibilidad, useEliminarDisponibilidad } from "@/hooks/useDisponibilidades";
import { useDragFranja, GhostFranja } from "@/hooks/useDragFranja";
import { FranjaDisponibilidad } from "./FranjaDisponibilidad";
import { ModalFranjaMobile } from "./ModalFranjaMobile";

interface CalendarioGridProps {
  inicioSemana: Date;
  diaVisibleMobile: Date;
  setDiaVisibleMobile: (d: Date) => void;
  isMobile: boolean;
  disponibilidades?: Disponibilidad[];
}

export function CalendarioGrid({ 
  inicioSemana, 
  diaVisibleMobile, 
  setDiaVisibleMobile, 
  isMobile,
  disponibilidades = []
}: CalendarioGridProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const dias = useMemo(() => diasDeSemana(inicioSemana), [inicioSemana]);
  const franjas = useMemo(() => franjasHorarias(), []);
  const hoy = new Date();
  
  // Mapeo por día
  const disponibilidadesPorDia = useMemo(() => {
    const map = new Map<string, Disponibilidad[]>();
    disponibilidades.forEach(d => {
      const key = d.inicio_at.toISOString().split('T')[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return map;
  }, [disponibilidades]);

  const columnasVisibles = isMobile 
    ? [dias.find(d => isMounted ? mismoDia(d, diaVisibleMobile) : false) || dias[0]] 
    : dias;

  // --- MUTACIONES ---
  const crearMutation = useCrearDisponibilidad();
  const actualizarMutation = useActualizarDisponibilidad();
  const eliminarMutation = useEliminarDisponibilidad();

  const isSavingFranja = (id?: string) => {
    if (!id && crearMutation.isPending) return true;
    if (id && (actualizarMutation.isPending || eliminarMutation.isPending)) return true;
    return false;
  };

  // --- SOLAPAMIENTO ---
  const hasOverlap = useCallback((dia: Date, inicioMin: number, finMin: number, omitirId?: string) => {
    return disponibilidades.some(d => {
      if (d.id === omitirId) return false;
      if (!mismoDia(d.inicio_at, dia)) return false;
      
      const dInicio = d.inicio_at.getHours() * 60 + d.inicio_at.getMinutes();
      const dFin = d.fin_at.getHours() * 60 + d.fin_at.getMinutes();
      
      return inicioMin < dFin && finMin > dInicio;
    });
  }, [disponibilidades]);

  // --- DESKTOP DRAG & DROP ---
  const handleDragEnd = useCallback((ghost: GhostFranja) => {
    if (ghost.inicio_minutos >= ghost.fin_minutos) return;
    
    if (hasOverlap(ghost.dia, ghost.inicio_minutos, ghost.fin_minutos, ghost.originalId)) {
      toast.error("Esta franja se superpone con otra existente");
      return;
    }

    const inicioAt = new Date(ghost.dia);
    inicioAt.setHours(Math.floor(ghost.inicio_minutos / 60), ghost.inicio_minutos % 60, 0, 0);
    
    const finAt = new Date(ghost.dia);
    finAt.setHours(Math.floor(ghost.fin_minutos / 60), ghost.fin_minutos % 60, 0, 0);

    if (ghost.action === 'crear') {
      crearMutation.mutate({ inicio_at: inicioAt, fin_at: finAt });
    } else if (ghost.action === 'redimensionar' && ghost.originalId) {
      actualizarMutation.mutate({ id: ghost.originalId, cambios: { fin_at: finAt } });
    }
  }, [crearMutation, actualizarMutation, hasOverlap]);

  const { ghost, handlePointerDown } = useDragFranja(handleDragEnd, isMobile);

  const handleDelete = (id: string) => {
    if (window.confirm("¿Eliminar esta franja de disponibilidad? Esta acción se puede revertir desde la base de datos si es necesario.")) {
      eliminarMutation.mutate(id);
    }
  };

  // --- MOBILE MODAL ---
  const [modalState, setModalState] = useState<{
    open: boolean;
    dia: Date | null;
    franjaId?: string | null;
    inicio?: number;
    fin?: number;
  }>({ open: false, dia: null });

  const handleMobileCellClick = (dia: Date) => {
    if (!isMobile) return;
    setModalState({ open: true, dia, franjaId: null });
  };

  const handleMobileEditClick = (dia: Date, id: string, inicio: number, fin: number) => {
    if (!isMobile) return;
    setModalState({ open: true, dia, franjaId: id, inicio, fin });
  };

  const handleModalSave = (inicio: number, fin: number) => {
    if (!modalState.dia) return;
    
    if (hasOverlap(modalState.dia, inicio, fin, modalState.franjaId || undefined)) {
      toast.error("Esta franja se superpone con otra existente");
      return;
    }

    const inicioAt = new Date(modalState.dia);
    inicioAt.setHours(Math.floor(inicio / 60), inicio % 60, 0, 0);
    
    const finAt = new Date(modalState.dia);
    finAt.setHours(Math.floor(fin / 60), fin % 60, 0, 0);

    if (modalState.franjaId) {
      actualizarMutation.mutate(
        { id: modalState.franjaId, cambios: { inicio_at: inicioAt, fin_at: finAt } },
        { onSuccess: () => setModalState({ ...modalState, open: false }) }
      );
    } else {
      crearMutation.mutate(
        { inicio_at: inicioAt, fin_at: finAt },
        { onSuccess: () => setModalState({ ...modalState, open: false }) }
      );
    }
  };

  const handleModalDelete = () => {
    if (!modalState.franjaId) return;
    if (window.confirm("¿Eliminar esta franja de disponibilidad?")) {
      eliminarMutation.mutate(modalState.franjaId, {
        onSuccess: () => setModalState({ ...modalState, open: false })
      });
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Pills para Mobile */}
      {isMobile && (
        <div className="flex overflow-x-auto p-2 border-b border-border bg-muted/20 hide-scrollbar gap-1">
          {dias.map(dia => {
            const isSelected = mismoDia(dia, diaVisibleMobile);
            const isToday = isMounted ? mismoDia(dia, hoy) : false;
            
            return (
              <Button
                key={dia.toISOString()}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex-shrink-0 rounded-full",
                  !isSelected && isToday && "text-primary border border-primary/20 bg-primary/5"
                )}
                onClick={() => setDiaVisibleMobile(dia)}
              >
                {formatoDiaCorto(dia)}
              </Button>
            );
          })}
        </div>
      )}

      {/* Cabecera del Grid (Nombres de los días) */}
      <div className="flex border-b border-border bg-muted/10 sticky top-0 z-30">
        <div className="w-16 sm:w-20 shrink-0 border-r border-border bg-muted/10" />
        
        {columnasVisibles.map(dia => {
          const isToday = isMounted ? mismoDia(dia, hoy) : false;
          return (
            <div 
              key={dia.toISOString()} 
              className={cn(
                "flex-1 py-3 text-center border-r border-border last:border-r-0",
                isToday ? "bg-primary/5" : ""
              )}
            >
              <div className={cn(
                "text-sm font-medium",
                isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {formatoDiaCorto(dia)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cuerpo del Grid (Horas y Celdas) */}
      <ScrollArea className="flex-1 bg-card">
        <div className="flex min-h-[800px] pb-6">
          {/* Columna de Horas */}
          <div className="w-16 sm:w-20 shrink-0 border-r border-border flex flex-col relative z-20 bg-card">
            {franjas.map((franja, i) => (
              <div 
                key={franja.hora} 
                className={cn(
                  "relative w-full border-r border-border box-border flex items-start justify-end pt-1 pr-2 sm:pr-3",
                  isMobile ? "min-h-[44px]" : "h-6 sm:h-8"
                )}
              >
                {franja.etiquetaVisible && (
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground bg-card px-1 absolute top-0 right-2 sm:right-3 whitespace-nowrap leading-none z-10">
                    {franja.hora}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Columnas de Días */}
          <div className="flex flex-1 relative isolate">
            {columnasVisibles.map(dia => {
              const isToday = isMounted ? mismoDia(dia, hoy) : false;
              const franjasDelDia = disponibilidadesPorDia.get(dia.toISOString().split('T')[0]) || [];
              const isGhostDia = ghost && mismoDia(ghost.dia, dia);
              
              return (
                <div 
                  key={dia.toISOString()} 
                  className={cn(
                    "flex-1 flex flex-col border-r border-border last:border-r-0 relative calendario-columna touch-none",
                    isToday ? "bg-primary/[0.03]" : ""
                  )}
                  onPointerDown={(e) => handlePointerDown(e, dia, 'crear')}
                  onClick={() => handleMobileCellClick(dia)}
                >
                  {/* Línea de hora actual */}
                  {isToday && <IndicadorHoraActual isMobile={isMobile} />}
                  
                  {/* Celdas de 15 min visuales (guías) */}
                  {franjas.map(franja => (
                    <div 
                      key={`${dia.toISOString()}-${franja.hora}`}
                      className={cn(
                        "w-full border-b box-border transition-colors pointer-events-none",
                        franja.etiquetaVisible ? "border-border/60" : "border-border/30",
                        isMobile ? "min-h-[44px]" : "h-6 sm:h-8"
                      )}
                    />
                  ))}

                  {/* Render de disponibilidades reales */}
                  {franjasDelDia.map(d => {
                    const startMin = d.inicio_at.getHours() * 60 + d.inicio_at.getMinutes();
                    const endMin = d.fin_at.getHours() * 60 + d.fin_at.getMinutes();
                    
                    // Ocultar la real si se está redimensionando para mostrar solo el ghost
                    if (isGhostDia && ghost.originalId === d.id && ghost.action === 'redimensionar') {
                      return null;
                    }

                    return (
                      <FranjaDisponibilidad
                        key={d.id}
                        id={d.id}
                        inicio_minutos={startMin}
                        fin_minutos={endMin}
                        isMobile={isMobile}
                        isSaving={isSavingFranja(d.id)}
                        onDelete={handleDelete}
                        onEdit={(id) => handleMobileEditClick(dia, id, startMin, endMin)}
                        onResizeStart={(e, id, s, f) => handlePointerDown(e, dia, 'redimensionar', { id, inicio_minutos: s, fin_minutos: f })}
                      />
                    );
                  })}

                  {/* Render de ghost (creación o redimensión) */}
                  {isGhostDia && (
                    <FranjaDisponibilidad
                      id="ghost"
                      inicio_minutos={ghost.inicio_minutos}
                      fin_minutos={ghost.fin_minutos}
                      isMobile={isMobile}
                      isGhost={true}
                      ghostAction={ghost.action}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <ModalFranjaMobile
        open={modalState.open}
        onOpenChange={(open) => setModalState(prev => ({ ...prev, open }))}
        dia={modalState.dia}
        initialInicioMinutos={modalState.inicio}
        initialFinMinutos={modalState.fin}
        franjaId={modalState.franjaId}
        onGuardar={handleModalSave}
        onEliminar={modalState.franjaId ? handleModalDelete : undefined}
        isSaving={isSavingFranja(modalState.franjaId || undefined)}
      />
    </div>
  );
}
