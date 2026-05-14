import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { LogoTurnoDental } from "@/components/ui/LogoTurnoDental";

import { supabase } from "@/lib/supabase";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("¡Bienvenida de nuevo!");
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md border-white/5 bg-[#121212]/80 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-x-0 h-1 top-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500" />
        
        <CardHeader className="space-y-3 pt-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
            <LogoTurnoDental size={36} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">TurnoDental</CardTitle>
            <CardDescription className="text-zinc-400 text-base">
              Identificate para gestionar tu agenda
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="dentista@consultorio.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Acceder al Panel"
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pb-8 pt-2">
          <p className="text-xs text-center w-full text-zinc-500">
            Gestionado de forma segura · {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
