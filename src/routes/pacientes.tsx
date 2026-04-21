import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Ban, CalendarPlus } from "lucide-react";
import { pacientes as pacientesMock, turnos, servicios, type EstadoPaciente, type Paciente } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pacientes")({
  head: () => ({ meta: [{ title: "Pacientes — TurnoDental" }] }),
  component: PacientesPage,
});

const estadoBadge: Record<EstadoPaciente, string> = {
  nuevo: "bg-info/10 text-info border-info/30",
  activo: "bg-success/15 text-success-foreground border-success/40",
  bloqueado: "bg-destructive/10 text-destructive border-destructive/30",
};
const estadoLabel: Record<EstadoPaciente, string> = { nuevo: "Nuevo", activo: "Activo", bloqueado: "Bloqueado" };

function PacientesPage() {
  const [list, setList] = useState<Paciente[]>(pacientesMock);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | EstadoPaciente>("todos");

  const filtered = useMemo(() => list.filter((p) => {
    const matchQ = (p.nombre + " " + p.apellido + " " + p.telefono).toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "todos" || p.estado === filter;
    return matchQ && matchF;
  }), [list, q, filter]);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Tu cartera</p>
          <h1 className="text-3xl font-semibold">Pacientes</h1>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Cargá los datos en el formulario.")}>
          <Plus className="size-4" /> Nuevo paciente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nombre o teléfono…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="activo">Activos</TabsTrigger>
            <TabsTrigger value="nuevo">Nuevos</TabsTrigger>
            <TabsTrigger value="bloqueado">Bloqueados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="p-3 font-medium">Paciente</th>
                <th className="p-3 font-medium">Teléfono</th>
                <th className="p-3 font-medium">Obra social</th>
                <th className="p-3 font-medium">Último turno</th>
                <th className="p-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <PacienteSheet paciente={p} onUpdate={(np) => setList((arr) => arr.map((x) => x.id === np.id ? np : x))} />
                  </td>
                  <td className="p-3 text-muted-foreground tabular-nums">{p.telefono}</td>
                  <td className="p-3 text-muted-foreground">{p.obraSocial}</td>
                  <td className="p-3 text-muted-foreground tabular-nums">{p.ultimoTurno || "—"}</td>
                  <td className="p-3"><Badge variant="outline" className={cn("border", estadoBadge[p.estado])}>{estadoLabel[p.estado]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function PacienteSheet({ paciente, onUpdate }: { paciente: Paciente; onUpdate: (p: Paciente) => void }) {
  const [obs, setObs] = useState(paciente.observaciones);
  const historial = turnos.filter((t) => t.pacienteId === paciente.id).sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="font-medium hover:underline text-left">{paciente.nombre} {paciente.apellido}</button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{paciente.nombre} {paciente.apellido}</SheetTitle>
          <SheetDescription>Ficha del paciente</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-4 px-1">
          <section className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Nombre</Label><Input defaultValue={paciente.nombre} /></div>
            <div className="space-y-1.5"><Label>Apellido</Label><Input defaultValue={paciente.apellido} /></div>
            <div className="space-y-1.5"><Label>Teléfono</Label><Input defaultValue={paciente.telefono} /></div>
            <div className="space-y-1.5"><Label>Obra social</Label><Input defaultValue={paciente.obraSocial} /></div>
            <div className="space-y-1.5 col-span-2"><Label>DNI</Label><Input defaultValue={paciente.dni || ""} placeholder="Opcional" /></div>
          </section>

          <section>
            <Label className="mb-1.5 block">Observaciones</Label>
            <Textarea rows={6} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Notas libres: alergias, antecedentes, lo que quieras recordar…" />
            <Button size="sm" className="mt-2" onClick={() => { onUpdate({ ...paciente, observaciones: obs }); toast.success("Observaciones guardadas"); }}>
              Guardar observaciones
            </Button>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Historial de turnos</h3>
            <div className="rounded-lg border border-border divide-y divide-border">
              {historial.length === 0 && <div className="p-3 text-sm text-muted-foreground">Sin turnos registrados.</div>}
              {historial.map((t) => {
                const s = servicios.find((x) => x.id === t.servicioId)!;
                return (
                  <div key={t.id} className="p-3 text-sm flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium tabular-nums">{t.fecha} · {t.hora}</div>
                      <div className="text-muted-foreground">{s.nombre}</div>
                    </div>
                    <Badge variant="outline">{t.estado}</Badge>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => toast.success("Abrí el calendario para agendar.")}>
              <CalendarPlus className="size-4" /> Nuevo turno manual
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Ban className="size-4" /> Bloquear paciente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Bloquear a {paciente.nombre}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    No va a poder pedir nuevos turnos ni recibir recordatorios. Podés revertirlo después.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onUpdate({ ...paciente, estado: "bloqueado" }); toast.success("Paciente bloqueado"); }}>
                    Sí, bloquear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}