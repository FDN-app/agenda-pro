import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { inicioDeSemana, finDeSemana } from "@/lib/calendario/utils";
import { CalendarioHeader } from "@/components/calendario/CalendarioHeader";
import { CalendarioGrid } from "@/components/calendario/CalendarioGrid";
import { ModalTurno } from "@/components/calendario/ModalTurno";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDisponibilidadesPorRango } from "@/hooks/useDisponibilidades";
import { useTurnosPorRango } from "@/hooks/useTurnos";
import type { Turno } from "@/lib/api/turnos";

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

  // --- Data: disponibilidades + turnos de la semana visible ---
  const finSemanaVisible = finDeSemana(inicioSemana);
  const { data: disponibilidades = [] } = useDisponibilidadesPorRango(inicioSemana, finSemanaVisible);
  const { data: turnos = [] } = useTurnosPorRango(inicioSemana, finSemanaVisible);

  // --- Estado del modal de turnos ---
  const [modalTurnoOpen, setModalTurnoOpen] = useState(false);
  const [turnoEnEdicion, setTurnoEnEdicion] = useState<Turno | null>(null);
  const [fechaInicioSugerida, setFechaInicioSugerida] = useState<Date | undefined>();

  // --- Handlers ---

  const handleCrearTurno = () => {
    // Botón "+ Nuevo turno" del header: sin fecha precargada
    setTurnoEnEdicion(null);
    setFechaInicioSugerida(undefined);
    setModalTurnoOpen(true);
  };

  const handleClickFranjaParaTurno = (fechaInicio: Date) => {
    // Clic en disponibilidad (desktop): precargar fecha/hora
    setTurnoEnEdicion(null);
    setFechaInicioSugerida(fechaInicio);
    setModalTurnoOpen(true);
  };

  const handleClickTurno = (turno: Turno) => {
    // Clic en turno existente: abrir en modo editar
    setTurnoEnEdicion(turno);
    setFechaInicioSugerida(undefined);
    setModalTurnoOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalTurnoOpen(open);
    if (!open) {
      setTurnoEnEdicion(null);
      setFechaInicioSugerida(undefined);
    }
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
            turnos={turnos}
            onClickFranjaParaTurno={handleClickFranjaParaTurno}
            onClickTurno={handleClickTurno}
          />
        </div>
      </div>

      <ModalTurno
        open={modalTurnoOpen}
        onOpenChange={handleCloseModal}
        turnoExistente={turnoEnEdicion || undefined}
        fechaInicioSugerida={fechaInicioSugerida}
        disponibilidades={disponibilidades}
        turnos={turnos}
      />
    </DashboardLayout>
  );
}