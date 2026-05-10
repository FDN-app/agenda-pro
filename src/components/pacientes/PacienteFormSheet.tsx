import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter, SheetClose
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { useCrearPaciente, useActualizarPaciente } from "@/hooks/usePacientes";
import type { Paciente, EstadoPaciente, PacienteInsert } from "@/lib/api/pacientes";

export function PacienteFormSheet({ children, mode, paciente }: { children: React.ReactNode; mode: "create" | "edit"; paciente?: Paciente }) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [obraSocial, setObraSocial] = useState("none");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState<EstadoPaciente>("nuevo");
  const [errorField, setErrorField] = useState<string | null>(null);

  const { mutate: crear, isPending: creando } = useCrearPaciente();
  const { mutate: actualizar, isPending: actualizando } = useActualizarPaciente();

  const isPending = creando || actualizando;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && paciente) {
        setNombre(paciente.nombre);
        setApellido(paciente.apellido);
        setTelefono(paciente.telefono);
        setDni(paciente.dni || "");
        setObraSocial(paciente.obra_social || "none");
        setObservaciones(paciente.observaciones || "");
        setEstado(paciente.estado);
      } else {
        setNombre("");
        setApellido("");
        setTelefono("");
        setDni("");
        setObraSocial("none");
        setObservaciones("");
        setEstado("nuevo");
      }
      setErrorField(null);
    }
  }, [open, mode, paciente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2) return setErrorField("El nombre debe tener al menos 2 caracteres");
    if (apellido.trim().length < 2) return setErrorField("El apellido debe tener al menos 2 caracteres");
    if (telefono.trim().length < 8) return setErrorField("El teléfono no es válido");

    const data: PacienteInsert = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim(),
      dni: dni.trim() || null,
      obra_social: obraSocial === "none" ? null : obraSocial,
      observaciones: observaciones.trim() || null,
      estado,
    };

    if (mode === "create") {
      crear(data, {
        onSuccess: () => {
          toast.success("Paciente creado");
          setOpen(false);
        },
        onError: (err) => {
          toast.error(err.message);
        }
      });
    } else {
      if (!paciente) return;
      actualizar({ id: paciente.id, data }, {
        onSuccess: () => {
          toast.success("Paciente actualizado");
          setOpen(false);
        },
        onError: (err) => {
          toast.error(err.message);
        }
      });
    }
  };

  const obrasSociales = ["OSDE", "Swiss Medical", "Galeno", "IOMA", "PAMI", "Particular", "Otra"];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "Nuevo paciente" : "Editar paciente"}</SheetTitle>
          <SheetDescription>
            {mode === "create" ? "Registrá un paciente nuevo en tu cartera." : "Modificá los datos del paciente."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {errorField && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
              {errorField}
            </div>
          )}
          
          <section className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre <span className="text-destructive">*</span></Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Apellido <span className="text-destructive">*</span></Label>
              <Input value={apellido} onChange={e => setApellido(e.target.value)} required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono <span className="text-destructive">*</span></Label>
              <Input value={telefono} onChange={e => setTelefono(e.target.value)} required placeholder="+54911..." />
            </div>
            <div className="space-y-1.5">
              <Label>DNI</Label>
              <Input value={dni} onChange={e => setDni(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Obra social</Label>
              <Select value={obraSocial} onValueChange={setObraSocial}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground italic">Ninguna</SelectItem>
                  {obrasSociales.map(os => <SelectItem key={os} value={os}>{os}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {mode === "edit" && (
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={(v) => setEstado(v as EstadoPaciente)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5 col-span-2">
              <Label>Observaciones</Label>
              <Textarea rows={4} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Alergias, antecedentes..." />
            </div>
          </section>

          <SheetFooter className="gap-2 sm:gap-0 mt-8">
            <SheetClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {mode === "create" ? "Guardar paciente" : "Actualizar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
