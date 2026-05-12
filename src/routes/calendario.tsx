import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { inicioDeSemana, mismoDia, finDeSemana } from "@/lib/calendario/utils";
import { CalendarioHeader } from "@/components/calendario/CalendarioHeader";
import { CalendarioGrid } from "@/components/calendario/CalendarioGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDisponibilidadesPorRango } from "@/hooks/useDisponibilidades";

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
  const [diaVisibleMobile, setDiaVisibleMobile] = useState<Date>(() => {
    const l = inicioDeSemana(hoy);
    const s = finDeSemana(hoy);
    if (hoy >= l && hoy <= s) {
      return hoy;
    }
    return l;
  });

  useEffect(() => {
    const l = inicioSemana;
    const s = finDeSemana(inicioSemana);
    
    if (diaVisibleMobile < l || diaVisibleMobile > s) {
      if (hoy >= l && hoy <= s) {
        setDiaVisibleMobile(hoy);
      } else {
        setDiaVisibleMobile(l);
      }
    }
  }, [inicioSemana]);

  // Cargar disponibilidades de la semana visible
  const finSemanaVisible = finDeSemana(inicioSemana);
  const { data: disponibilidades = [] } = useDisponibilidadesPorRango(inicioSemana, finSemanaVisible);

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
          cantidadDisponibilidades={disponibilidades.length}
          onCambiarSemana={handleCambiarSemana}
          onCrearTurno={handleCrearTurno}
        />
        
        <div className="flex-1 mt-2 min-h-0">
          <CalendarioGrid 
            inicioSemana={inicioSemana}
            diaVisibleMobile={diaVisibleMobile}
            setDiaVisibleMobile={setDiaVisibleMobile}
            isMobile={isMobile}
            disponibilidades={disponibilidades}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}