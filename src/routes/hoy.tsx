import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarCheck, CheckCircle2, Clock, XCircle, MessageSquare, AlertTriangle, UserX, Edit3,
} from "lucide-react";
import {
  turnos as turnosMock, pacientes, servicios, fechaLarga, estadoConfig, type EstadoTurno, type Turno,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hoy")({
  head: () => ({ meta: [{ title: "Hoy — TurnoDental" }] }),
  component: HoyPage,
});

const todayIso = new Date().toISOString().slice(0, 10);

function HoyPage() {
  const [list, setList] = useState<Turno[]>(turnosMock);

  const turnosHoy = useMemo(
    () => list.filter((t) => t.fecha === todayIso).sort((a, b) => a.hora.localeCompare(b.hora)),
    [list],
  );

  const stats = useMemo(() => ({
    total: turnosHoy.length,
    confirmados: turnosHoy.filter((t) => t.estado === "confirmado" || t.estado === "completado").length,
    pendientes: turnosHoy.filter((t) => t.estado === "agendado").length,
    cancelados: turnosHoy.filter((t) => t.estado === "cancelado" || t.estado === "no_vino").length,
  }), [turnosHoy]);

  const cambiar = (id: string, estado: EstadoTurno, msg: string) => {
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
    toast.success(msg);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Tu día</p>
          <h1 className="text-3xl font-semibold capitalize">{fechaLarga()}</h1>
        </div>
        <Link to="/solicitudes">
          <Button variant="outline" className="gap-2 border-warning/40 bg-warning/10 hover:bg-warning/15 text-warning-foreground">
            <AlertTriangle className="size-4" />
            5 solicitudes nuevas
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={CalendarCheck} label="Turnos hoy" value={stats.total} tone="info" />
        <StatCard icon={CheckCircle2} label="Confirmados" value={stats.confirmados} tone="success" />
        <StatCard icon={Clock} label="Pendientes" value={stats.pendientes} tone="warning" />
        <StatCard icon={XCircle} label="Cancelados" value={stats.cancelados} tone="destructive" />
      </div>

      <h2 className="text-lg font-semibold mb-3">Agenda del día</h2>
      <div className="space-y-3">
        {turnosHoy.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">No hay turnos para hoy.</Card>
        )}
        {turnosHoy.map((t) => {
          const p = pacientes.find((x) => x.id === t.pacienteId)!;
          const s = servicios.find((x) => x.id === t.servicioId)!;
          const cfg = estadoConfig[t.estado];
          return (
            <Card key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex sm:flex-col sm:w-20 items-center sm:items-start gap-2">
                <div className="text-2xl font-semibold tabular-nums text-foreground">{t.hora}</div>
                <div className="text-xs text-muted-foreground">{t.duracionMin} min</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base">{p.nombre} {p.apellido}</h3>
                  <Badge variant="outline" className={cn("text-xs border", cfg.className)}>{cfg.label}</Badge>
                  {t.aclaracion && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                            <MessageSquare className="size-3.5" />Aclaración
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{t.aclaracion}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {s.nombre} · {p.obraSocial} · {p.telefono}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5"
                  onClick={() => cambiar(t.id, "completado", `Turno de ${p.nombre} marcado como completado`)}>
                  <CheckCircle2 className="size-4" /> Completar
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5"
                  onClick={() => cambiar(t.id, "no_vino", `${p.nombre} marcado como no vino`)}>
                  <UserX className="size-4" /> No vino
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                      <XCircle className="size-4" /> Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Cancelar turno?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se va a cancelar el turno de {p.nombre} {p.apellido} a las {t.hora}. El paciente recibirá un aviso.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Volver</AlertDialogCancel>
                      <AlertDialogAction onClick={() => cambiar(t.id, "cancelado", "Turno cancelado")}>
                        Sí, cancelar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => toast.info("Edición próximamente.")}>
                  <Edit3 className="size-4" /> Editar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon, label, value, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number;
  tone: "info" | "success" | "warning" | "destructive";
}) {
  const tones = {
    info:        "bg-info/10 text-info",
    success:     "bg-success/15 text-success-foreground",
    warning:     "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <Card className="p-4 sm:p-5 flex items-center gap-4">
      <div className={cn("size-11 rounded-xl grid place-items-center", tones[tone])}>
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}