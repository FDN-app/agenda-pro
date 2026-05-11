import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  diasDeSemana, 
  franjasHorarias, 
  formatoDiaCorto, 
  mismoDia 
} from "@/lib/calendario/utils";
import { IndicadorHoraActual } from "./IndicadorHoraActual";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarioGridProps {
  inicioSemana: Date;
  diaVisibleMobile: Date;
  setDiaVisibleMobile: (d: Date) => void;
  isMobile: boolean;
}

export function CalendarioGrid({ 
  inicioSemana, 
  diaVisibleMobile, 
  setDiaVisibleMobile, 
  isMobile 
}: CalendarioGridProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const dias = useMemo(() => diasDeSemana(inicioSemana), [inicioSemana]);
  const franjas = useMemo(() => franjasHorarias(), []);
  
  const hoy = new Date();
  
  // Días que se van a mostrar en las columnas (6 en desktop, 1 en mobile)
  const columnasVisibles = isMobile 
    ? [dias.find(d => isMounted ? mismoDia(d, diaVisibleMobile) : false) || dias[0]] 
    : dias;

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
        {/* Espacio vacío arriba de la columna de horas */}
        <div className="w-16 sm:w-20 shrink-0 border-r border-border bg-muted/10" />
        
        {/* Cabeceras de los días */}
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
        <div className="flex min-h-[800px] pt-3 pb-6">
          {/* Columna de Horas */}
          <div className="w-16 sm:w-20 shrink-0 border-r border-border flex flex-col relative z-20 bg-card">
            {franjas.map((franja, i) => (
              <div 
                key={franja.hora} 
                className={cn(
                  "relative w-full border-r border-border box-border flex items-start justify-end pt-1 pr-2 sm:pr-3",
                  isMobile ? "min-h-[44px]" : "h-6 sm:h-8" // 14px es muy poco incluso en desktop, mejor 24px (h-6) o 32px (h-8)
                )}
              >
                {franja.etiquetaVisible && (
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground bg-card px-1 absolute top-0 -translate-y-1/2 right-2 sm:right-3 whitespace-nowrap leading-none z-10">
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
              
              return (
                <div 
                  key={dia.toISOString()} 
                  className={cn(
                    "flex-1 flex flex-col border-r border-border last:border-r-0 relative",
                    isToday ? "bg-primary/[0.03]" : ""
                  )}
                >
                  {/* Línea de hora actual si el día de esta columna es hoy */}
                  {isToday && <IndicadorHoraActual isMobile={isMobile} />}
                  
                  {/* Celdas de 15 min */}
                  {franjas.map(franja => (
                    <div 
                      key={`${dia.toISOString()}-${franja.hora}`}
                      className={cn(
                        "w-full border-b box-border transition-colors",
                        franja.etiquetaVisible ? "border-border/60" : "border-border/30",
                        isMobile ? "min-h-[44px]" : "h-6 sm:h-8"
                      )}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
