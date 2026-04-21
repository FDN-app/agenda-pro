import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Ban, CalendarPlus, Plus } from "lucide-react";
import { turnos as turnosMock, pacientes, servicios, estadoConfig } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({ meta: [{ title: "Calendario — TurnoDental" }] }),
  component: CalendarioPage,
});

function startOfWeek(d: Date) {
  const out = new Date(d);
  const day = (out.getDay() + 6) % 7; // Monday=0
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

const HOURS = Array.from({ length: 20 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function CalendarioPage() {
  const [anchor, setAnchor] = useState(new Date());

  const weekStart = startOfWeek(anchor);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const turnosByDate = useMemo(() => {
    const map = new Map<string, typeof turnosMock>();
    turnosMock.forEach((t) => {
      const arr = map.get(t.fecha) || [];
      arr.push(t);
      map.set(t.fecha, arr);
    });
    return map;
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Tu agenda</p>
          <h1 className="text-3xl font-semibold">Calendario</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Semana abierta. Disponibilidad creada.")}>
            <CalendarPlus className="size-4" /> Abrir semana
          </Button>
          <BlockDialog />
          <NewTurnoDialog />
        </div>
      </div>

      <Tabs defaultValue="semana">
        <div className="flex items-center justify-between mb-4 gap-3">
          <TabsList>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mes</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => setAnchor((d) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x; })}>
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-medium min-w-[160px] text-center capitalize">
              {weekStart.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} — {weekDays[6].toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
            </div>
            <Button size="icon" variant="outline" onClick={() => setAnchor((d) => { const x = new Date(d); x.setDate(x.getDate() + 7); return x; })}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="semana">
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="grid min-w-[900px]" style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}>
                <div className="bg-muted/50 border-b border-border" />
                {weekDays.map((d) => (
                  <div key={d.toISOString()} className="bg-muted/50 border-b border-l border-border p-2 text-center">
                    <div className="text-xs text-muted-foreground capitalize">{d.toLocaleDateString("es-AR", { weekday: "short" })}</div>
                    <div className="text-sm font-semibold">{d.getDate()}</div>
                  </div>
                ))}

                {HOURS.map((h) => (
                  <>
                    <div key={"h" + h} className="text-[11px] text-muted-foreground p-1.5 text-right pr-2 border-b border-border tabular-nums">
                      {h.endsWith("00") ? h : ""}
                    </div>
                    {weekDays.map((d) => {
                      const iso = d.toISOString().slice(0, 10);
                      const t = (turnosByDate.get(iso) || []).find((x) => x.hora === h);
                      return (
                        <button
                          key={iso + h}
                          onClick={() => !t && toast.info(`Slot libre: ${d.toLocaleDateString("es-AR")} ${h}`)}
                          className="border-l border-b border-border h-8 hover:bg-muted/50 relative text-left"
                        >
                          {t && (
                            <div className={cn("absolute inset-x-0.5 top-0.5 rounded-md px-1.5 py-0.5 text-[11px] truncate border", estadoConfig[t.estado].className)}
                              style={{ height: `${(t.duracionMin / 30) * 32 - 4}px` }}>
                              {pacientes.find((p) => p.id === t.pacienteId)?.apellido}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mes">
          <MonthView anchor={anchor} turnosByDate={turnosByDate} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function MonthView({ anchor, turnosByDate }: { anchor: Date; turnosByDate: Map<string, typeof turnosMock> }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), i));
  while (cells.length % 7) cells.push(null);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2 capitalize">
        {["lun","mar","mié","jue","vie","sáb","dom"].map((d) => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square rounded-md bg-muted/30" />;
          const iso = d.toISOString().slice(0, 10);
          const count = (turnosByDate.get(iso) || []).length;
          const isToday = iso === new Date().toISOString().slice(0, 10);
          return (
            <div key={i} className={cn("aspect-square rounded-md border border-border p-1.5 flex flex-col", isToday && "ring-2 ring-primary")}>
              <div className="text-xs font-medium">{d.getDate()}</div>
              {count > 0 && (
                <div className="mt-auto text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-info/10 text-info rounded px-1.5 py-0.5">{count} turno{count > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function BlockDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><Ban className="size-4" /> Bloquear horario</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear un horario</DialogTitle>
          <DialogDescription>El rango quedará marcado como no disponible.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" /></div>
          <div className="space-y-1.5"><Label>Motivo</Label><Input placeholder="Ej: Almuerzo" /></div>
          <div className="space-y-1.5"><Label>Desde</Label><Input type="time" defaultValue="12:00" /></div>
          <div className="space-y-1.5"><Label>Hasta</Label><Input type="time" defaultValue="14:00" /></div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Horario bloqueado")}>Bloquear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewTurnoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="size-4" /> Nuevo turno</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear turno manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Elegí un paciente" /></SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Servicio</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Elegí un servicio" /></SelectTrigger>
              <SelectContent>
                {servicios.map((s) => <SelectItem key={s.id} value={s.id}>{s.nombre} ({s.duracionMin} min)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" /></div>
            <div className="space-y-1.5"><Label>Hora</Label><Input type="time" defaultValue="10:00" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Turno creado")}>Crear turno</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}