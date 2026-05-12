import { useState, useRef, useCallback } from 'react';
import { HORA_INICIO, HORA_FIN, MINUTOS_SLOT } from '@/lib/calendario/utils';

export type DragAction = 'crear' | 'redimensionar';

export interface GhostFranja {
  dia: Date;
  inicio_minutos: number;
  fin_minutos: number;
  action: DragAction;
  originalId?: string;
}

export function useDragFranja(
  onDragEnd: (ghost: GhostFranja) => void,
  isMobile: boolean
) {
  const [ghost, setGhost] = useState<GhostFranja | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    action: DragAction;
    dia: Date;
    startMin: number;
    columnRect: DOMRect;
    originalId?: string;
  } | null>(null);

  const TOTAL_MINUTES = (HORA_FIN - HORA_INICIO) * 60 + MINUTOS_SLOT;

  const getMinutesFromY = useCallback((clientY: number, rect: DOMRect) => {
    let relativeY = clientY - rect.top;
    if (relativeY < 0) relativeY = 0;
    if (relativeY > rect.height) relativeY = rect.height;
    
    const percentage = relativeY / rect.height;
    const rawMinutes = Math.round(percentage * TOTAL_MINUTES);
    const absoluteMinutes = (HORA_INICIO * 60) + rawMinutes;
    return Math.round(absoluteMinutes / MINUTOS_SLOT) * MINUTOS_SLOT;
  }, [TOTAL_MINUTES]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const state = dragStateRef.current;
    if (!state || !state.active) return;

    const currentMin = getMinutesFromY(e.clientY, state.columnRect);
    
    let newStart = state.startMin;
    let newEnd = currentMin;

    if (state.action === 'crear') {
      if (currentMin < state.startMin) {
        newStart = currentMin;
        newEnd = state.startMin;
      } else {
        newStart = state.startMin;
        newEnd = currentMin;
      }
      if (newEnd === newStart) newEnd += MINUTOS_SLOT;
    } else {
      newStart = state.startMin;
      newEnd = currentMin;
      if (newEnd <= newStart) newEnd = newStart + MINUTOS_SLOT;
    }

    setGhost({
      dia: state.dia,
      action: state.action,
      inicio_minutos: newStart,
      fin_minutos: newEnd,
      originalId: state.originalId
    });
  }, [getMinutesFromY]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    const state = dragStateRef.current;
    if (!state || !state.active) return;

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    const currentMin = getMinutesFromY(e.clientY, state.columnRect);
    let newStart = state.startMin;
    let newEnd = currentMin;

    if (state.action === 'crear') {
      if (currentMin < state.startMin) {
        newStart = currentMin;
        newEnd = state.startMin;
      } else {
        newStart = state.startMin;
        newEnd = currentMin;
      }
      if (newEnd === newStart) newEnd += MINUTOS_SLOT;
    } else {
      newStart = state.startMin;
      newEnd = currentMin;
      if (newEnd <= newStart) newEnd = newStart + MINUTOS_SLOT;
    }

    const finalGhost = {
      dia: state.dia,
      action: state.action,
      inicio_minutos: newStart,
      fin_minutos: newEnd,
      originalId: state.originalId
    };

    setGhost(null);
    dragStateRef.current = null;
    
    onDragEnd(finalGhost);
  }, [getMinutesFromY, handlePointerMove, onDragEnd]);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    dia: Date,
    action: DragAction,
    originalFranja?: { id: string; inicio_minutos: number; fin_minutos: number }
  ) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (isMobile) return;

    e.preventDefault();
    e.stopPropagation();
    
    const columnEl = (e.currentTarget as HTMLElement).closest('.calendario-columna');
    if (!columnEl) return;
    
    const rect = columnEl.getBoundingClientRect();
    const currentMin = getMinutesFromY(e.clientY, rect);

    const startMin = action === 'redimensionar' && originalFranja ? originalFranja.inicio_minutos : currentMin;

    dragStateRef.current = {
      active: true,
      action,
      dia,
      startMin,
      columnRect: rect,
      originalId: originalFranja?.id
    };

    setGhost({
      dia,
      action,
      inicio_minutos: startMin,
      fin_minutos: action === 'redimensionar' && originalFranja ? originalFranja.fin_minutos : startMin + MINUTOS_SLOT,
      originalId: originalFranja?.id
    });

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [isMobile, getMinutesFromY, handlePointerMove, handlePointerUp]);

  return {
    ghost,
    handlePointerDown
  };
}
