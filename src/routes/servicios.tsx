import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { servicios as serviciosMock, formatARS, type Servicio } from "@/data/mockData";

export const Route = createFileRoute("/servicios")({
  head: () => ({ meta: [{ title: "Servicios — TurnoDental" }] }),
  component: ServiciosPage,
});

function ServiciosPage() {
  const [list, setList] = useState<Servicio[]>(serviciosMock);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Catálogo</p>
          <h1 className="text-3xl font-semibold">Servicios</h1>
        </div>
        <ServicioDialog onSave={(s) => { setList((prev) => [...prev, { ...s, id: "s" + (prev.length + 1) }]); toast.success("Servicio agregado"); }} />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">Servicio</th>
              <th className="p-3 font-medium">Duración</th>
              <th className="p-3 font-medium">Precio</th>
              <th className="p-3 font-medium">Activo</th>
              <th className="p-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.nombre}</td>
                <td className="p-3 text-muted-foreground">{s.duracionMin} min</td>
                <td className="p-3 tabular-nums">{formatARS(s.precio)}</td>
                <td className="p-3">
                  <Switch checked={s.activo} onCheckedChange={(v) => {
                    setList((prev) => prev.map((x) => x.id === s.id ? { ...x, activo: v } : x));
                    toast.success(v ? "Servicio activado" : "Servicio desactivado");
                  }} />
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Edición próximamente.")}><Edit3 className="size-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                        <AlertDialogDescription>Se va a eliminar "{s.nombre}". Los turnos pasados no se modifican.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setList((prev) => prev.filter((x) => x.id !== s.id)); toast.success("Servicio eliminado"); }}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}

function ServicioDialog({ onSave }: { onSave: (s: Omit<Servicio, "id">) => void }) {
  const [nombre, setNombre] = useState("");
  const [dur, setDur] = useState(30);
  const [precio, setPrecio] = useState(20000);
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Nuevo servicio</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo servicio</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Blanqueamiento" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Duración (min)</Label><Input type="number" value={dur} onChange={(e) => setDur(+e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Precio (ARS)</Label><Input type="number" value={precio} onChange={(e) => setPrecio(+e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => nombre && onSave({ nombre, duracionMin: dur, precio, activo: true })}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}