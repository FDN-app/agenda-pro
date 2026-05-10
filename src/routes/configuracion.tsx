import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";
import { useConfiguracion, useActualizarConfiguracion } from "@/hooks/useConfiguracion";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/configuracion")({
  head: () => ({ meta: [{ title: "Configuración — TurnoDental" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const { perfil } = useAuth();
  const isAdmin = perfil?.rol === "admin";
  
  const { data: config, isLoading, isError, refetch } = useConfiguracion();
  const { mutate: actualizar, isPending: actualizando } = useActualizarConfiguracion();

  const [nombre, setNombre] = useState("");
  const [hayCambios, setHayCambios] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setNombre(config.nombre_consultorio);
      setHayCambios(false);
      setErrorNombre(null);
    }
  }, [config]);

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombre(val);
    if (config) {
      setHayCambios(val !== config.nombre_consultorio);
    }
    
    if (val.trim().length < 2) {
      setErrorNombre("El nombre debe tener al menos 2 caracteres");
    } else if (val.length > 100) {
      setErrorNombre("El nombre no puede exceder 100 caracteres");
    } else {
      setErrorNombre(null);
    }
  };

  const handleGuardar = () => {
    if (!config || !isAdmin) return;
    if (errorNombre) return;
    
    if (nombre.trim().length < 2 || nombre.trim().length > 100) return;

    actualizar({ id: config.id, data: { nombre_consultorio: nombre.trim() } }, {
      onSuccess: () => setHayCambios(false)
    });
  };

  const handleDescartar = () => {
    if (config) {
      setNombre(config.nombre_consultorio);
      setHayCambios(false);
      setErrorNombre(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Datos del consultorio</p>
        <h1 className="text-3xl font-semibold">Configuración</h1>
      </div>

      <Tabs defaultValue="consultorio">
        <TabsList className="mb-4">
          <TabsTrigger value="consultorio">Consultorio</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="consultorio">
          <Card className="p-6 max-w-2xl min-h-[300px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <Loader2 className="size-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Cargando configuración...</p>
              </div>
            ) : isError || !config ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-lg font-medium mb-1 text-destructive">Error al cargar</h3>
                <p className="text-muted-foreground mb-4">No se encontró la configuración del consultorio.</p>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                  <RefreshCw className="size-4" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {!isAdmin && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-md text-sm font-medium">
                    Solo el administrador puede modificar esta configuración.
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="nombre_consultorio">Nombre del consultorio</Label>
                  <Input 
                    id="nombre_consultorio"
                    value={nombre} 
                    onChange={handleNombreChange}
                    disabled={!isAdmin || actualizando}
                    className={cn(
                      hayCambios && "border-amber-500/50 focus-visible:ring-amber-500/50"
                    )}
                  />
                  {errorNombre ? (
                    <p className="text-xs text-destructive">{errorNombre}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Este nombre se mostrará en mensajes a pacientes y en el panel.
                    </p>
                  )}
                </div>

                {/* Los horarios se eliminaron y se gestionarán desde el Calendario */}
                <p className="text-sm text-muted-foreground italic border-t border-border pt-4">
                  Nota: La disponibilidad y los horarios de atención ahora se configuran directamente desde el Calendario.
                </p>

                {hayCambios && isAdmin && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2">
                    <Button 
                      onClick={handleGuardar} 
                      disabled={actualizando || !!errorNombre}
                      className="w-full sm:w-auto"
                    >
                      {actualizando ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Guardar cambios
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleDescartar} 
                      disabled={actualizando}
                      className="w-full sm:w-auto"
                    >
                      Descartar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="plantillas">
          <Card className="p-8 max-w-2xl text-center bg-muted/30 border-dashed">
            <h3 className="text-xl font-semibold mb-2 opacity-80">Plantillas de mensajes</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Disponible próximamente. Se habilitará esta sección al conectar el bot de WhatsApp.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}