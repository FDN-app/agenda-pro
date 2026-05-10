import { Outlet, Link, createRootRoute, HeadContent, Scripts, redirect, useRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function RootComponent() {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si cambia el estado de usuario (ej. token expira o login en otra pestaña),
    // invalidamos el enrutador para forzar que beforeLoad corra de nuevo.
    router.invalidate();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-zinc-400 font-medium animate-pulse">Cargando TurnoDental...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

function Main() {
  return (
    <AuthProvider>
      <RootComponent />
    </AuthProvider>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuth = !!session;

    if (!isAuth && location.pathname !== '/login') {
      throw redirect({
        to: '/login',
      });
    }
    if (isAuth && location.pathname === '/login') {
      throw redirect({
        to: '/',
      });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TurnoDental — Gestión" },
      { name: "description", content: "Sistema de gestión odontológica" },
      { name: "author", content: "TurnoDental" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: Main,
  notFoundComponent: NotFoundComponent,
});
