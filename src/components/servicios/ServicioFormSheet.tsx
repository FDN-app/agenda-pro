import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter, SheetClose
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { useCrearServicio, useActualizarServicio } from "@/hooks/useServicios";
import type { Servicio, ServicioInsert } from "@/lib/api/servicios";
import { cn } from "@/lib/utils";

const PREDEFINED_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"
];

function formatDurationHint(minutes: number): string {
  if (!minutes || isNaN(minutes) || minutes < 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `= ${m} min`;
  if (m === 0) return `= ${h} hora${h > 1 ? "s" : ""}`;
  return `= ${h} hora${h > 1 ? "s" : ""} ${m} min`;
}

export function ServicioFormSheet({ children, mode, servicio }: { children: React.ReactNode; mode: "create" | "edit"; servicio?: Servicio }) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [duracionMin, setDuracionMin] = useState<number>(30);
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [activo, setActivo] = useState(true);
  const [errorField, setErrorField] = useState<string | null>(null);

  const { mutate: crear, isPending: creando } = useCrearServicio();
  const { mutate: actualizar, isPending: actualizando } = useActualizarServicio();

  const isPending = creando || actualizando;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && servicio) {
        setNombre(servicio.nombre);
        setDuracionMin(servicio.duracion_min);
        setColor(servicio.color || PREDEFINED_COLORS[0]);
        setActivo(servicio.activo);
      } else {
        setNombre("");
        setDuracionMin(30);
        setColor(PREDEFINED_COLORS[0]);
        setActivo(true);
      }
      setErrorField(null);
    }
  }, [open, mode, servicio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2) return setErrorField("El nombre debe tener al menos 2 caracteres");
    if (nombre.trim().length > 100) return setErrorField("El nombre no puede exceder 100 caracteres");
    if (duracionMin < 5 || duracionMin > 480) return setErrorField("La duración debe estar entre 5 y 480 minutos");

    const data: ServicioInsert = {
      nombre: nombre.trim(),
      duracion_min: duracionMin,
      color,
      activo,
    };

    if (mode === "create") {
      crear(data, {
        onSuccess: () => {
          setOpen(false);
        }
      });
    } else {
      if (!servicio) return;
      actualizar({ id: servicio.id, data }, {
        onSuccess: () => {
          setOpen(false);
        }
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "Nuevo servicio" : "Editar servicio"}</SheetTitle>
          <SheetDescription>
            {mode === "create" ? "Agregá un nuevo tipo de atención." : "Modificá los detalles del servicio."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {errorField && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
              {errorField}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre del servicio <span className="text-destructive">*</span></Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} required minLength={2} maxLength={100} placeholder="Ej: Extracción" />
            </div>

            <div className="space-y-1.5">
              <Label>Duración <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number" 
                  value={duracionMin} 
                  onChange={e => setDuracionMin(parseInt(e.target.value) || 0)} 
                  required 
                  min={5} 
                  max={480} 
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutos</span>
                <span className="text-sm font-medium ml-2 text-indigo-400">
                  {formatDurationHint(duracionMin)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color en calendario</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {PREDEFINED_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      color === c ? "ring-2 ring-offset-2 ring-foreground" : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Seleccionar color ${c}`}
                  />
                ))}
              </div>
            </div>

            {mode === "edit" && (
              <div className="flex items-center justify-between pt-4 pb-2 border-t border-border/50">
                <div className="space-y-0.5">
                  <Label>Servicio activo</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar este servicio en el calendario
                  </p>
                </div>
                <Switch checked={activo} onCheckedChange={setActivo} />
              </div>
            )}
          </div>

          <SheetFooter className="gap-2 sm:gap-0 mt-8 pt-4 border-t border-border/50">
            <SheetClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {mode === "create" ? "Guardar servicio" : "Actualizar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
