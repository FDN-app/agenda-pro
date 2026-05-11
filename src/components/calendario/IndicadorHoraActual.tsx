import { useState, useEffect } from "react";
import { HORA_INICIO, HORA_FIN } from "@/lib/calendario/utils";
import { cn } from "@/lib/utils";

export function IndicadorHoraActual({ isMobile }: { isMobile?: boolean }) {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    // Actualizar la hora cada minuto
    const interval = setInterval(() => {
      setAhora(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const h = ahora.getHours();
  const m = ahora.getMinutes();

  // Si la hora actual no está dentro del horario de atención, no mostramos la línea
  if (h < HORA_INICIO || h > HORA_FIN || (h === HORA_FIN && m > 0)) {
    return null;
  }

  // Calcular la posición (0% es HORA_INICIO, 100% es HORA_FIN)
  const minutosTotales = (HORA_FIN - HORA_INICIO) * 60;
  const minutosTranscurridos = (h - HORA_INICIO) * 60 + m;
  const topPercentage = (minutosTranscurridos / minutosTotales) * 100;

  return (
    <div 
      className={cn(
        "absolute left-0 right-0 z-20 pointer-events-none flex items-center",
        // En mobile, queremos que la bolita esté un poco desfasada hacia la izquierda o que la línea cubra todo
        isMobile ? "-ml-2" : ""
      )}
      style={{ top: `${topPercentage}%` }}
    >
      <div className="w-2 h-2 rounded-full bg-red-500 absolute -translate-y-1/2 left-0 z-20 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
      <div className="h-[2px] bg-red-500/80 w-full shadow-[0_1px_2px_rgba(239,68,68,0.2)]" />
    </div>
  );
}
