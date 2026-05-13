import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle } from 'lucide-react';
import { getFranjaStyles } from './FranjaDisponibilidad';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Turno, EstadoTurno } from '@/lib/api/turnos';

// ---------- Props ----------

interface TurnoBloqueProps {
  turno: Turno;
  onClick: (turno: Turno) => void;
  isMobile: boolean;
  /** Posición: índice de columna dentro de un cluster de overlap */
  columnaIndex?: number;
  /** Posición: total de columnas en el cluster */
  totalColumnas?: number;
}

// ---------- Helpers ----------

/** Determina si un color hex es "claro" para elegir texto oscuro o claro. */
function esColorClaro(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Fórmula de luminancia relativa simplificada
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6;
}

function formatoHoraCorta(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/** Nombre corto del paciente: "Nombre A." */
function nombreCorto(paciente?: { nombre: string; apellido: string }): string {
  if (!paciente) return '';
  return `${paciente.nombre} ${paciente.apellido.charAt(0)}.`;
}

/** Nombre completo del paciente. */
function nombreCompleto(paciente?: { nombre: string; apellido: string }): string {
  if (!paciente) return 'Paciente desconocido';
  return `${paciente.nombre} ${paciente.apellido}`;
}

// Color neutro para turnos sin servicio
const COLOR_SIN_SERVICIO = '#64748b'; // slate-500

// ---------- Componente ----------

export function TurnoBloque({
  turno,
  onClick,
  isMobile,
  columnaIndex = 0,
  totalColumnas = 1,
}: TurnoBloqueProps) {
  const startMin = turno.inicio_at.getHours() * 60 + turno.inicio_at.getMinutes();
  const endMin = turno.fin_at.getHours() * 60 + turno.fin_at.getMinutes();
  const duracionMin = endMin - startMin;

  const bgColor = turno.servicio?.color || COLOR_SIN_SERVICIO;
  const textoOscuro = esColorClaro(bgColor);
  const textColor = textoOscuro ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
  const textShadow = textoOscuro ? 'none' : '0 1px 2px rgba(0,0,0,0.3)';

  const positionStyle = getFranjaStyles(startMin, endMin);

  // Calcular ancho/offset para overlap side-by-side
  const widthPercent = totalColumnas > 1 ? (100 / totalColumnas) : 100;
  const leftPercent = totalColumnas > 1 ? (columnaIndex * widthPercent) : 0;

  // Estilos según estado
  const estiloEstado = useMemo(() => {
    const base: React.CSSProperties = {};
    const clases: string[] = [];

    switch (turno.estado) {
      case 'cumplido':
        base.opacity = 0.6;
        clases.push('line-through');
        break;
      case 'cancelado':
        base.opacity = 0.4;
        base.borderStyle = 'dashed';
        break;
      case 'ausente':
        base.opacity = 0.55;
        break;
      case 'confirmado':
        base.borderWidth = '2px';
        base.borderColor = textoOscuro ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.5)';
        break;
      // 'programado' = estilo base
    }

    return { style: base, clases };
  }, [turno.estado, textoOscuro]);

  // Texto del bloque según espacio disponible
  const horaStr = formatoHoraCorta(turno.inicio_at);
  const nombre = nombreCorto(turno.paciente);
  const textoBloque = duracionMin <= 15 ? nombre : `${horaStr} · ${nombre}`;

  const bloqueElement = (
    <div
      className={cn(
        'absolute rounded-md overflow-hidden cursor-pointer z-30 border transition-shadow',
        'hover:shadow-lg hover:brightness-110',
        isMobile ? 'mx-0.5' : 'mx-1',
        estiloEstado.clases,
      )}
      style={{
        ...positionStyle,
        backgroundColor: bgColor,
        color: textColor,
        textShadow,
        width: totalColumnas > 1 ? `calc(${widthPercent}% - ${isMobile ? 4 : 8}px)` : undefined,
        left: totalColumnas > 1 ? `calc(${leftPercent}% + ${isMobile ? 2 : 4}px)` : undefined,
        borderColor: `color-mix(in srgb, ${bgColor} 70%, black)`,
        ...estiloEstado.style,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(turno);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Turno de ${nombreCompleto(turno.paciente)} a las ${horaStr}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(turno);
        }
      }}
    >
      {/* Contenido del bloque */}
      <div className="px-1.5 py-0.5 flex items-center gap-1 min-h-[18px] relative">
        {/* Indicadores de estado */}
        {turno.estado === 'confirmado' && (
          <Check className="w-3 h-3 shrink-0" style={{ color: textColor }} />
        )}
        {turno.estado === 'ausente' && (
          <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: textColor }} />
        )}

        {/* Texto principal */}
        <span className={cn(
          'text-[11px] sm:text-xs font-medium truncate leading-tight',
          turno.estado === 'cumplido' && 'line-through',
        )}>
          {textoBloque}
        </span>
      </div>

      {/* Servicio (solo si hay espacio - turnos > 30 min) */}
      {duracionMin > 30 && turno.servicio && (
        <div className="px-1.5 pb-0.5">
          <span className="text-[10px] truncate block" style={{ color: textColor, opacity: 0.8 }}>
            {turno.servicio.nombre}
          </span>
        </div>
      )}
    </div>
  );

  // En mobile, sin tooltip (ya no tienen hover)
  if (isMobile) return bloqueElement;

  // Desktop: tooltip con datos completos
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {bloqueElement}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-[280px] bg-popover text-popover-foreground border shadow-md p-3 space-y-1.5"
        >
          <p className="font-semibold text-sm">
            {nombreCompleto(turno.paciente)}
          </p>
          {turno.paciente?.telefono && (
            <p className="text-xs text-muted-foreground">{turno.paciente.telefono}</p>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span>{formatoHoraCorta(turno.inicio_at)} — {formatoHoraCorta(turno.fin_at)}</span>
            <span className="text-muted-foreground">({duracionMin} min)</span>
          </div>
          {turno.servicio && (
            <div className="flex items-center gap-1.5 text-xs">
              {turno.servicio.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: turno.servicio.color }}
                />
              )}
              <span>{turno.servicio.nombre}</span>
            </div>
          )}
          <p className="text-xs capitalize text-muted-foreground">
            Estado: {turno.estado}
          </p>
          {turno.notas && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-1.5 mt-1">
              {turno.notas}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------- Helpers de layout para overlap clusters ----------

/**
 * Agrupa turnos del mismo día en clusters de overlap.
 * Los turnos dentro de un cluster se solapan entre sí y deben renderizarse side-by-side.
 */
export function calcularColumnasOverlap(turnos: Turno[]): Map<string, { columnaIndex: number; totalColumnas: number }> {
  const resultado = new Map<string, { columnaIndex: number; totalColumnas: number }>();

  if (turnos.length === 0) return resultado;

  // Ordenar por inicio
  const sorted = [...turnos].sort((a, b) => a.inicio_at.getTime() - b.inicio_at.getTime());

  // Agrupar en clusters (greedy interval partitioning)
  const clusters: Turno[][] = [];

  for (const turno of sorted) {
    let added = false;
    for (const cluster of clusters) {
      // Un turno pertenece al cluster si se solapa con al menos uno del cluster
      const overlaps = cluster.some(t =>
        turno.inicio_at < t.fin_at && turno.fin_at > t.inicio_at
      );
      if (overlaps) {
        cluster.push(turno);
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push([turno]);
    }
  }

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      resultado.set(cluster[0].id, { columnaIndex: 0, totalColumnas: 1 });
    } else {
      // Asignar columnas greedily
      const columnas: Turno[][] = [];
      const sortedCluster = [...cluster].sort((a, b) => a.inicio_at.getTime() - b.inicio_at.getTime());

      for (const turno of sortedCluster) {
        let placed = false;
        for (let c = 0; c < columnas.length; c++) {
          const lastInCol = columnas[c][columnas[c].length - 1];
          if (turno.inicio_at >= lastInCol.fin_at) {
            columnas[c].push(turno);
            resultado.set(turno.id, { columnaIndex: c, totalColumnas: 0 }); // totalColumnas se setea después
            placed = true;
            break;
          }
        }
        if (!placed) {
          columnas.push([turno]);
          resultado.set(turno.id, { columnaIndex: columnas.length - 1, totalColumnas: 0 });
        }
      }

      // Setear totalColumnas para todos los turnos del cluster
      const total = columnas.length;
      for (const turno of sortedCluster) {
        const entry = resultado.get(turno.id)!;
        entry.totalColumnas = total;
      }
    }
  }

  return resultado;
}
