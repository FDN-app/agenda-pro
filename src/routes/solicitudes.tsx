import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Edit3, MessageCircle, CalendarPlus } from "lucide-react";
import { solicitudesNuevas, consultasPrevias, servicios } from "@/data/mockData";

export const Route = createFileRoute("/solicitudes")({
  head: () => ({ meta: [{ title: "Solicitudes — TurnoDental" }] }),
  component: SolicitudesPage,
});

function SolicitudesPage() {
  const [sols, setSols] = useState(solicitudesNuevas);
  const [cons, setCons] = useState(consultasPrevias);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Bandeja</p>
        <h1 className="text-3xl font-semibold">Solicitudes pendientes</h1>
      </div>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold">Solicitudes de turno</h2>
          <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/30">{sols.length}</Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {sols.length === 0 && (
            <Card className="p-6 text-muted-foreground sm:col-span-2 text-center">No hay solicitudes pendientes.</Card>
          )}
          {sols.map((s) => {
            const serv = servicios.find((x) => x.id === s.servicioId)!;
            return (
              <Card key={s.id} className="p-5 space-y-3">
                <div>
                  <h3 className="font-semibold">{s.nombre} {s.apellido}</h3>
                  <p className="text-sm text-muted-foreground">{s.telefono} · {s.obraSocial}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                  <div><span className="text-muted-foreground">Servicio:</span> {serv.nombre} ({serv.duracionMin} min)</div>
                  <div><span className="text-muted-foreground">Pidió:</span> {s.fecha} a las {s.hora}</div>
                  {s.aclaracion && (
                    <div className="pt-1 italic text-muted-foreground">"{s.aclaracion}"</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5"
                    onClick={() => { setSols((p) => p.filter((x) => x.id !== s.id)); toast.success(`Turno aprobado para ${s.nombre}`); }}>
                    <Check className="size-4" /> Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info("Modificá el horario y aprobá.")}>
                    <Edit3 className="size-4" /> Modificar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => { setSols((p) => p.filter((x) => x.id !== s.id)); toast.success("Solicitud rechazada"); }}>
                    <X className="size-4" /> Rechazar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold">Consultas previas</h2>
          <Badge variant="outline" className="bg-violet/15 text-violet border-violet/30">{cons.length}</Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {cons.length === 0 && (
            <Card className="p-6 text-muted-foreground sm:col-span-2 text-center">No hay consultas pendientes.</Card>
          )}
          {cons.map((c) => (
            <Card key={c.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{c.nombre} {c.apellido}</h3>
                  <p className="text-sm text-muted-foreground">{c.telefono} · {c.obraSocial}</p>
                </div>
                <MessageCircle className="size-5 text-violet" />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm italic text-foreground/90">
                "{c.mensaje}"
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5"><CalendarPlus className="size-4" /> Asignar turno</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Asignar turno a {c.nombre}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Servicio</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Elegí servicio" /></SelectTrigger>
                        <SelectContent>{servicios.map((s) => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" /></div>
                      <div className="space-y-1.5"><Label>Hora</Label><Input type="time" /></div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => { setCons((p) => p.filter((x) => x.id !== c.id)); toast.success(`Turno asignado a ${c.nombre}`); }}>
                      Asignar y avisar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}