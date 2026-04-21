import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { consultorio, plantillasMensajes } from "@/data/mockData";

export const Route = createFileRoute("/configuracion")({
  head: () => ({ meta: [{ title: "Configuración — TurnoDental" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const [plantillas, setPlantillas] = useState(plantillasMensajes);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Ajustes</p>
        <h1 className="text-3xl font-semibold">Configuración</h1>
      </div>

      <Tabs defaultValue="consultorio">
        <TabsList className="mb-4">
          <TabsTrigger value="consultorio">Consultorio</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="consultorio">
          <Card className="p-6 space-y-5 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2"><Label>Nombre del consultorio</Label><Input defaultValue={consultorio.nombre} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Dirección</Label><Input defaultValue={consultorio.direccion} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Teléfono de contacto</Label><Input defaultValue={consultorio.telefono} /></div>
            </div>
            <div>
              <Label className="mb-2 block">Horarios de atención</Label>
              <div className="rounded-lg border border-border divide-y divide-border">
                {consultorio.horarios.map((h) => (
                  <div key={h.dia} className="grid grid-cols-3 gap-3 p-3 items-center">
                    <div className="font-medium">{h.dia}</div>
                    <Input defaultValue={h.desde} placeholder="Desde" />
                    <Input defaultValue={h.hasta} placeholder="Hasta" />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => toast.success("Datos del consultorio guardados")}>Guardar cambios</Button>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas">
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Editá los mensajes para que suenen con tu tono. Placeholders disponibles: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{"{nombre}"}</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{"{fecha}"}</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{"{hora}"}</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{"{servicio}"}</code>
            </p>
            {plantillas.map((p) => (
              <Card key={p.id} className="p-5 space-y-3">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input value={p.nombre} onChange={(e) => setPlantillas((arr) => arr.map((x) => x.id === p.id ? { ...x, nombre: e.target.value } : x))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Mensaje</Label>
                  <Textarea rows={4} value={p.contenido}
                    onChange={(e) => setPlantillas((arr) => arr.map((x) => x.id === p.id ? { ...x, contenido: e.target.value } : x))} />
                </div>
                <Button size="sm" onClick={() => toast.success("Plantilla guardada")}>Guardar</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preferencias">
          <Card className="p-6 space-y-5 max-w-xl">
            <div className="space-y-1.5">
              <Label>Antelación del recordatorio</Label>
              <Select defaultValue="24">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 horas antes</SelectItem>
                  <SelectItem value="48">48 horas antes</SelectItem>
                  <SelectItem value="ambos">24 y 48 horas antes</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <div className="font-medium">Segundo recordatorio</div>
                <div className="text-sm text-muted-foreground">Mandar otro aviso 2 horas antes del turno.</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => toast.success("Preferencias guardadas")}>Guardar preferencias</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}