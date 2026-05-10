import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Phone, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { usePaciente, useActualizarObservaciones } from "@/hooks/usePacientes";
import { PacienteFormSheet } from "@/components/pacientes/PacienteFormSheet";
import type { EstadoPaciente } from "@/lib/api/pacientes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pacientes/$id")({
  head: () => ({ meta: [{ title: "Ficha del Paciente — TurnoDental" }] }),
  component: PacienteDetallePage,
});

const estadoBadge: Record<EstadoPaciente, string> = {
  todos: "",
  nuevo: "bg-info/10 text-info border-info/30",
  activo: "bg-success/15 text-success-foreground border-success/40",
  bloqueado: "bg-destructive/10 text-destructive border-destructive/30",
};
const estadoLabel: Record<EstadoPaciente, string> = { todos: "Todos", nuevo: "Nuevo", activo: "Activo", bloqueado: "Bloqueado" };

function PacienteDetallePage() {
  const { id } = Route.useParams();
  const { data: paciente, isLoading, isError } = usePaciente(id);
  const { mutate: actualizarObs, isPending: actualizandoObs } = useActualizarObservaciones();

  const [obs, setObs] = useState("");
  const [hayCambios, setHayCambios] = useState(false);

  useEffect(() => {
    if (paciente) {
      setObs(paciente.observaciones || "");
      setHayCambios(false);
    }
  }, [paciente]);

  const handleObsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObs(e.target.value);
    setHayCambios(e.target.value !== (paciente?.observaciones || ""));
  };

  const handleGuardarObs = () => {
    if (!paciente) return;
    actualizarObs({ id: paciente.id, observaciones: obs }, {
      onSuccess: () => setHayCambios(false)
    });
  };

  const handleDescartarObs = () => {
    if (!paciente) return;
    setObs(paciente.observaciones || "");
    setHayCambios(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando ficha del paciente...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !paciente) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 gap-4">
          <h3 className="text-xl font-semibold">Paciente no encontrado</h3>
          <p className="text-muted-foreground max-w-sm">
            El paciente que intentás ver no existe o fue eliminado de la base de datos.
          </p>
          <Button asChild variant="outline">
            <Link to="/pacientes">Volver a pacientes</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Formato de fecha "10 de mayo de 2026"
  const fechaAlta = new Date(paciente.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <DashboardLayout>
      <div className="mb-6 space-y-4">
        <Button asChild variant="ghost" className="gap-2 -ml-3 text-muted-foreground hover:text-foreground">
          <Link to="/pacientes">
            <ArrowLeft className="size-4" /> Volver a pacientes
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Ficha del paciente</p>
          <h1 className="text-3xl font-semibold">Detalle</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Datos básicos */}
        <Card className="p-6 lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold leading-tight">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <Badge variant="outline" className={cn("border mt-1 shrink-0", estadoBadge[paciente.estado])}>
                {estadoLabel[paciente.estado]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" />
              <span className="tabular-nums">{paciente.telefono}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DNI</span>
              <p className="mt-1 font-medium">{paciente.dni || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Obra Social</span>
              <p className="mt-1 font-medium">{paciente.obra_social || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alta en sistema</span>
              <p className="mt-1 text-sm text-muted-foreground">{fechaAlta}</p>
            </div>
          </div>

          <div className="pt-2">
            <PacienteFormSheet mode="edit" paciente={paciente}>
              <Button variant="outline" className="w-full">
                Editar datos
              </Button>
            </PacienteFormSheet>
          </div>
        </Card>

        {/* Columna Derecha: Observaciones e Historial */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Observaciones</h3>
              {hayCambios && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20">
                  Sin guardar
                </Badge>
              )}
            </div>
            <div className="space-y-4">
              <Textarea
                className={cn(
                  "min-h-[160px] resize-y text-base transition-colors",
                  hayCambios && "border-amber-500/50 focus-visible:ring-amber-500/50"
                )}
                placeholder="Notas sobre alergias, tratamientos pendientes, preferencias del paciente, etc."
                value={obs}
                onChange={handleObsChange}
              />
              {hayCambios && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <Button onClick={handleGuardarObs} disabled={actualizandoObs}>
                    {actualizandoObs ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                    Guardar observaciones
                  </Button>
                  <Button variant="ghost" onClick={handleDescartarObs} disabled={actualizandoObs}>
                    Descartar cambios
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Historial de turnos</h3>
            <div className="rounded-lg border border-border border-dashed p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <CalendarIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Aún no hay turnos registrados</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Se conectará al implementar el módulo de turnos.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
