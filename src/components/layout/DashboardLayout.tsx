import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, Home, Inbox, Users, Stethoscope, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { consultorio } from "@/data/mockData";
import { cn } from "@/lib/utils";

const items = [
  { to: "/hoy",            label: "Hoy",            icon: Home },
  { to: "/calendario",     label: "Calendario",     icon: Calendar },
  { to: "/solicitudes",    label: "Solicitudes",    icon: Inbox, badge: 5 },
  { to: "/pacientes",      label: "Pacientes",      icon: Users },
  { to: "/servicios",      label: "Servicios",      icon: Stethoscope },
  { to: "/configuracion",  label: "Configuración",  icon: Settings },
] as const;

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground flex-col fixed inset-y-0 left-0">
        <SidebarContent path={path} />
      </aside>

      {/* Sidebar mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col">
            <SidebarContent path={path} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border flex items-center gap-3 px-4 h-14">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-muted">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="font-semibold">TurnoDental</div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );

  function SidebarContent({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
    return (
      <>
        <div className="px-6 pt-6 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-bold">
              T
            </div>
            <div>
              <div className="font-semibold text-base">TurnoDental</div>
              <div className="text-xs opacity-70 truncate max-w-[160px]">{consultorio.nombre}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = path === it.to || (it.to !== "/hoy" && path.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/60 text-sidebar-foreground/85",
                )}
              >
                <it.icon className="size-4" />
                <span className="flex-1">{it.label}</span>
                {"badge" in it && it.badge ? (
                  <span className="text-[11px] bg-sidebar-primary text-sidebar-primary-foreground rounded-full px-2 py-0.5 font-semibold">
                    {it.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-sidebar-accent/60"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Link>
        </div>
      </>
    );
  }
}