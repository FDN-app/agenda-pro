import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { inicioDeSemana, mismoDia, finDeSemana } from "@/lib/calendario/utils";
import { CalendarioHeader } from "@/components/calendario/CalendarioHeader";
import { CalendarioGrid } from "@/components/calendario/CalendarioGrid";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/calendario")({
  head: () => ({ meta: [{ title: "Calendario — TurnoDental" }] }),
  component: CalendarioPage,
});

function CalendarioPage() {
  const hoy = new Date();
  const isMobile = useIsMobile();
  
  // Estado local para la semana visible (Lunes 00:00:00)
  const [inicioSemana, setInicioSemana] = useState<Date>(() => inicioDeSemana(hoy));
  
  // Estado local para el día visible en mobile
  // Arranca en hoy si hoy está en la semana actual, sino arranca en el lunes de esa semana
  const [diaVisibleMobile, setDiaVisibleMobile] = useState<Date>(() => {
    const l = inicioDeSemana(hoy);
    const s = finDeSemana(hoy);
    if (hoy >= l && hoy <= s) {
      return hoy;
    }
    return l;
  });

  // Efecto para actualizar el diaVisibleMobile cuando cambia la semana
  // Si en la nueva semana está "hoy", lo seleccionamos. Sino, seleccionamos el lunes.
  useEffect(() => {
    const l = inicioSemana;
    const s = finDeSemana(inicioSemana);
    
    // Solo si el día visible actual NO pertenece a la nueva semana mostrada
    if (diaVisibleMobile < l || diaVisibleMobile > s) {
      if (hoy >= l && hoy <= s) {
        setDiaVisibleMobile(hoy);
      } else {
        setDiaVisibleMobile(l);
      }
    }
  }, [inicioSemana]); // Se quita diaVisibleMobile y hoy de las dependencias para evitar ciclos

  const handleCrearTurno = () => {
    toast.info("Próximamente: Crear turnos desde el calendario");
  };

  const handleCambiarSemana = (nuevoInicio: Date) => {
    setInicioSemana(inicioDeSemana(nuevoInicio));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
        <CalendarioHeader 
          inicioSemana={inicioSemana}
          onCambiarSemana={handleCambiarSemana}
          onCrearTurno={handleCrearTurno}
        />
        
        <div className="flex-1 mt-2 min-h-0">
          <CalendarioGrid 
            inicioSemana={inicioSemana}
            diaVisibleMobile={diaVisibleMobile}
            setDiaVisibleMobile={setDiaVisibleMobile}
            isMobile={isMobile}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}