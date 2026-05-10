import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit3, Loader2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServiciosList, useEliminarServicio, useAlternarActivoServicio } from "@/hooks/useServicios";
import { ServicioFormSheet } from "@/components/servicios/ServicioFormSheet";
import type { Servicio } from "@/lib/api/servicios";

export const Route = createFileRoute("/servicios")({
  head: () => ({ meta: [{ title: "Servicios — TurnoDental" }] }),
  component: ServiciosPage,
});

function formatDuration(min: number) {
  if (!min || isNaN(min)) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function ServiciosPage() {
  const { data: servicios = [], isLoading, isError } = useServiciosList();
  const { mutate: toggleActivo } = useAlternarActivoServicio();

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Configuración de tipos de atención</p>
          <h1 className="text-3xl font-semibold">Servicios</h1>
        </div>
        <ServicioFormSheet mode="create">
          <Button className="gap-2">
            <Plus className="size-4" /> Nuevo servicio
          </Button>
        </ServicioFormSheet>
      </div>

      <Card className="p-0 overflow-hidden relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando servicios...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-destructive">Ocurrió un error al cargar los servicios.</p>
          </div>
        ) : servicios.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Cargá los servicios que ofrecés</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">No tenés ningún servicio configurado. Agregá tipos de consulta, tratamientos y sus duraciones.</p>
            <ServicioFormSheet mode="create">
              <Button variant="outline">Agregar servicio</Button>
            </ServicioFormSheet>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="p-3 font-medium w-12 text-center">Color</th>
                <th className="p-3 font-medium">Servicio</th>
                <th className="p-3 font-medium">Duración</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className={cn("border-t border-border transition-colors hover:bg-muted/30", !s.activo && "opacity-60 bg-muted/10")}>
                  <td className="p-3 text-center">
                    <div 
                      className="w-4 h-4 rounded-full mx-auto" 
                      style={{ backgroundColor: s.color || "#ccc" }} 
                      title={s.color || "Sin color"}
                    />
                  </td>
                  <td className="p-3 font-medium text-base">{s.nombre}</td>
                  <td className="p-3 text-muted-foreground tabular-nums">{formatDuration(s.duracion_min)}</td>
                  <td className="p-3">
                    {s.activo ? (
                      <Badge variant="outline" className="bg-success/15 text-success-foreground border-success/40">Activo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2 mr-2 border-r border-border pr-3">
                        <Label htmlFor={`switch-${s.id}`} className="sr-only">Toggle activo</Label>
                        <Switch 
                          id={`switch-${s.id}`} 
                          checked={s.activo} 
                          onCheckedChange={(v) => toggleActivo({ id: s.id, activo: v })} 
                        />
                      </div>
                      <ServicioFormSheet mode="edit" servicio={s}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit3 className="size-4" />
                        </Button>
                      </ServicioFormSheet>
                      <DeleteConfirm servicio={s} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function DeleteConfirm({ servicio }: { servicio: Servicio }) {
  const { mutate, isPending } = useEliminarServicio();

  const handleEliminar = () => {
    mutate(servicio.id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar el servicio {servicio.nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            Los turnos pasados que lo usen seguirán mostrándolo, pero ya no se podrá asignar a turnos nuevos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEliminar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
            {isPending ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}