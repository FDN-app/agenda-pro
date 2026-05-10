import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Trash2, Edit2, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePacientesList, useEliminarPaciente } from "@/hooks/usePacientes";
import type { Paciente, EstadoPaciente } from "@/lib/api/pacientes";
import { PacienteFormSheet } from "@/components/pacientes/PacienteFormSheet";

export const Route = createFileRoute("/pacientes/")({
  head: () => ({ meta: [{ title: "Pacientes — TurnoDental" }] }),
  component: PacientesPage,
});

const estadoBadge: Record<EstadoPaciente, string> = {
  todos: "",
  nuevo: "bg-info/10 text-info border-info/30",
  activo: "bg-success/15 text-success-foreground border-success/40",
  bloqueado: "bg-destructive/10 text-destructive border-destructive/30",
};
const estadoLabel: Record<EstadoPaciente, string> = { todos: "Todos", nuevo: "Nuevo", activo: "Activo", bloqueado: "Bloqueado" };

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

function PacientesPage() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [filter, setFilter] = useState<"todos" | EstadoPaciente>("todos");

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = usePacientesList({
    busqueda: debouncedQ,
    estado: filter,
    porPagina: 50
  });

  const pacientes = data?.pages.flatMap((p) => p.pacientes) || [];

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Tu cartera</p>
          <h1 className="text-3xl font-semibold">Pacientes</h1>
        </div>
        <PacienteFormSheet mode="create">
          <Button className="gap-2">
            <Plus className="size-4" /> Nuevo paciente
          </Button>
        </PacienteFormSheet>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nombre, apellido o teléfono…" value={q} onChange={(e) => setQ(e.target.value)} />
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

      <Card className="p-0 overflow-hidden relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando pacientes...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-destructive">Ocurrió un error al cargar los pacientes.</p>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-lg font-medium mb-1">No hay pacientes</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">No encontramos pacientes que coincidan con tu búsqueda o filtros.</p>
            <PacienteFormSheet mode="create">
              <Button variant="outline">Agregar paciente</Button>
            </PacienteFormSheet>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="p-3 font-medium">Paciente</th>
                <th className="p-3 font-medium">Teléfono</th>
                <th className="p-3 font-medium">Obra social</th>
                <th className="p-3 font-medium">Último turno</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">
                    <Link to="/pacientes/$id" params={{ id: p.id }} className="hover:underline hover:text-indigo-400 transition-colors">
                      {p.nombre} {p.apellido}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground tabular-nums">{p.telefono}</td>
                  <td className="p-3 text-muted-foreground">{p.obra_social || "—"}</td>
                  <td className="p-3 text-muted-foreground tabular-nums">—</td>
                  <td className="p-3"><Badge variant="outline" className={cn("border", estadoBadge[p.estado])}>{estadoLabel[p.estado]}</Badge></td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to="/pacientes/$id" params={{ id: p.id }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Eye className="size-4" />
                      </Link>
                      <PacienteFormSheet mode="edit" paciente={p}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit2 className="size-4" />
                        </Button>
                      </PacienteFormSheet>
                      <DeleteConfirm paciente={p} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {hasNextPage && (
          <div className="p-4 border-t border-border flex justify-center">
            <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cargar más pacientes
            </Button>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

function DeleteConfirm({ paciente }: { paciente: Paciente }) {
  const { mutate, isPending } = useEliminarPaciente();

  const handleEliminar = () => {
    mutate(paciente.id, {
      onSuccess: () => toast.success("Paciente eliminado"),
      onError: (err) => toast.error(err.message),
    });
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
          <AlertDialogTitle>¿Eliminar a {paciente.nombre} {paciente.apellido}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción se puede revertir desde la base de datos (soft delete). El paciente dejará de aparecer en la lista.
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