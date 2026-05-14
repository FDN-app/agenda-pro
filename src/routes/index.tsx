import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";
import { LogoTurnoDental } from "@/components/ui/LogoTurnoDental";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TurnoDental — Iniciar sesión" },
      { name: "description", content: "Sistema de turnos para tu consultorio odontológico." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("dra.fernandez@turnodental.com");
  const [password, setPassword] = useState("demo");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <LogoTurnoDental size={36} />
          <span className="text-xl font-semibold">TurnoDental</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight mb-4">
            Tu agenda al día,<br />sin teléfono ni planillas.
          </h1>
          <p className="text-sidebar-foreground/75 max-w-md">
            Recordatorios automáticos por WhatsApp, confirmación de pacientes y todo tu consultorio en un solo lugar.
          </p>
        </div>
        <div className="text-sm text-sidebar-foreground/60">© TurnoDental · Buenos Aires</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <LogoTurnoDental size={36} />
            <span className="text-xl font-semibold">TurnoDental</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <Stethoscope className="size-6 text-primary" />
            Bienvenida de nuevo
          </h2>
          <p className="text-muted-foreground mb-8">Ingresá para administrar tu agenda.</p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/hoy" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Contraseña</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" size="lg">Entrar</Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Demo: cualquier email y contraseña te dejan entrar.
          </p>
        </div>
      </div>
    </div>
  );
}
