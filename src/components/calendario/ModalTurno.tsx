import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { BuscadorPaciente } from '@/components/calendario/BuscadorPaciente';
import { useServiciosList } from '@/hooks/useServicios';
import { useCrearTurno, useActualizarTurno, useEliminarTurno } from '@/hooks/useTurnos';
import {
  ESTADOS_TURNO,
  tieneOverlapTurnos,
  estaDentroDeDisponibilidad,
  type Turno,
  type EstadoTurno,
} from '@/lib/api/turnos';

// ---------- Props ----------

interface ModalTurnoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fecha/hora sugerida al abrir en modo crear (clic en el calendario) */
  fechaInicioSugerida?: Date;
  /** Si está presente, el modal funciona en modo editar */
  turnoExistente?: Turno;
  /** Franjas de disponibilidad del día seleccionado, para validación */
  disponibilidadesDelDia?: { inicio_at: Date; fin_at: Date }[];
  /** Turnos del día seleccionado, para validación de overlap */
  turnosDelDia?: Turno[];
}

// ---------- Helpers locales ----------

const DURACION_DEFAULT = 30;
const DURACION_MIN = 15;

/** Genera opciones de hora con granularidad de 15 min (08:00–20:45). */
function opcionesHora(): { valor: string; label: string; minutos: number }[] {
  const opciones = [];
  for (let h = 8; h <= 20; h++) {
    const maxMin = h === 20 ? 45 : 45;
    for (let m = 0; m <= maxMin; m += 15) {
      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      opciones.push({
        valor: `${hStr}:${mStr}`,
        label: `${hStr}:${mStr}`,
        minutos: h * 60 + m,
      });
    }
  }
  return opciones;
}

/** Redondea una Date al slot de 15 min inferior más cercano, devuelve string "HH:mm". */
function horaASlot(date: Date): string {
  const h = date.getHours();
  const m = Math.floor(date.getMinutes() / 15) * 15;
  if (h < 8) return '08:00';
  if (h > 20 || (h === 20 && m > 45)) return '20:45';
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Convierte "HH:mm" a minutos totales desde medianoche. */
function slotAMinutos(slot: string): number {
  const [h, m] = slot.split(':').map(Number);
  return h * 60 + m;
}

/** Formatea minutos totales a string "HH:mm". */
function minutosAHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Labels legibles para estados de turno. */
const LABEL_ESTADO: Record<EstadoTurno, string> = {
  programado: 'Programado',
  confirmado: 'Confirmado',
  cumplido: 'Cumplido',
  cancelado: 'Cancelado',
  ausente: 'Ausente',
};

// ---------- Componente ----------

export function ModalTurno({
  open,
  onOpenChange,
  fechaInicioSugerida,
  turnoExistente,
  disponibilidadesDelDia = [],
  turnosDelDia = [],
}: ModalTurnoProps) {
  const modoEditar = !!turnoExistente;
  const horasDisponibles = useMemo(() => opcionesHora(), []);

  // --- Servicios ---
  const { data: todosServicios = [] } = useServiciosList();
  const serviciosActivos = useMemo(
    () => todosServicios.filter(s => s.activo && !s.deleted_at),
    [todosServicios]
  );

  // --- Form state ---
  const [pacienteId, setPacienteId] = useState<string | null>(null);
  const [pacienteInicial, setPacienteInicial] = useState<Turno['paciente'] | null>(null);
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [horaInicio, setHoraInicio] = useState<string>('09:00');
  const [duracionMin, setDuracionMin] = useState<number>(DURACION_DEFAULT);
  const [duracionModificadaManualmente, setDuracionModificadaManualmente] = useState(false);
  const [estado, setEstado] = useState<EstadoTurno>('programado');
  const [notas, setNotas] = useState('');

  // AlertDialog para "fuera de disponibilidad"
  const [alertFueraDisp, setAlertFueraDisp] = useState(false);

  // --- Mutations ---
  const crearMutation = useCrearTurno();
  const actualizarMutation = useActualizarTurno();
  const eliminarMutation = useEliminarTurno();
  const isSaving = crearMutation.isPending || actualizarMutation.isPending || eliminarMutation.isPending;

  // --- Hora fin calculada ---
  const inicioMinutos = slotAMinutos(horaInicio);
  const finMinutos = inicioMinutos + duracionMin;
  const horaFinLabel = minutosAHora(finMinutos);

  // --- Reset al abrir ---
  useEffect(() => {
    if (!open) return;

    if (turnoExistente) {
      // Modo editar: precargar datos del turno
      setPacienteId(turnoExistente.paciente_id);
      setPacienteInicial(turnoExistente.paciente || null);
      setServicioId(turnoExistente.servicio_id);
      setFecha(new Date(turnoExistente.inicio_at));
      setHoraInicio(horaASlot(turnoExistente.inicio_at));
      // Calcular duración desde inicio_at y fin_at
      const diffMs = turnoExistente.fin_at.getTime() - turnoExistente.inicio_at.getTime();
      setDuracionMin(Math.max(DURACION_MIN, Math.round(diffMs / 60000)));
      setEstado(turnoExistente.estado);
      setNotas(turnoExistente.notas || '');
    } else {
      // Modo crear: valores default
      setPacienteId(null);
      setPacienteInicial(null);
      setServicioId(null);

      if (fechaInicioSugerida) {
        setFecha(new Date(fechaInicioSugerida));
        setHoraInicio(horaASlot(fechaInicioSugerida));
      } else {
        setFecha(new Date());
        setHoraInicio('09:00');
      }

      setDuracionMin(DURACION_DEFAULT);
      setEstado('programado');
      setNotas('');
    }

    setDuracionModificadaManualmente(false);
    setAlertFueraDisp(false);
  }, [open, turnoExistente, fechaInicioSugerida]);

  // --- Handlers ---

  function handleServicioChange(value: string) {
    const sid = value === '__none__' ? null : value;
    setServicioId(sid);

    if (sid && !duracionModificadaManualmente) {
      const servicio = serviciosActivos.find(s => s.id === sid);
      if (servicio) {
        setDuracionMin(servicio.duracion_min);
      }
    }

    if (!sid && !duracionModificadaManualmente) {
      setDuracionMin(DURACION_DEFAULT);
    }
  }

  function handleDuracionChange(value: string) {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setDuracionMin(parsed);
      setDuracionModificadaManualmente(true);
    }
  }

  /** Construye los objetos Date de inicio y fin del turno a partir del form state. */
  function buildFechas(): { inicio: Date; fin: Date } {
    const inicio = new Date(fecha);
    const h = Math.floor(inicioMinutos / 60);
    const m = inicioMinutos % 60;
    inicio.setHours(h, m, 0, 0);

    const fin = new Date(inicio);
    fin.setMinutes(fin.getMinutes() + duracionMin);

    return { inicio, fin };
  }

  /** Ejecuta la mutación (crear o actualizar) sin más validaciones. */
  function ejecutarGuardado() {
    const { inicio, fin } = buildFechas();

    if (modoEditar && turnoExistente) {
      actualizarMutation.mutate(
        {
          id: turnoExistente.id,
          cambios: {
            paciente_id: pacienteId!,
            servicio_id: servicioId,
            inicio_at: inicio,
            fin_at: fin,
            notas: notas || null,
            estado,
          },
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      crearMutation.mutate(
        {
          paciente_id: pacienteId!,
          servicio_id: servicioId,
          inicio_at: inicio,
          fin_at: fin,
          notas: notas || null,
          estado: 'programado',
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  }

  /** Validaciones previas al guardado. */
  function handleSubmit() {
    // 1. Paciente obligatorio
    if (!pacienteId) {
      toast.error('Seleccioná un paciente');
      return;
    }

    // 2. Duración mínima
    if (duracionMin < DURACION_MIN) {
      toast.error(`La duración mínima es de ${DURACION_MIN} minutos`);
      return;
    }

    const { inicio, fin } = buildFechas();

    // 3. Overlap con otros turnos
    if (tieneOverlapTurnos(turnosDelDia, inicio, fin, turnoExistente?.id)) {
      toast.error('Este turno se superpone con otro turno existente');
      return;
    }

    // 4. Fuera de disponibilidad (warning, no bloqueante)
    if (
      disponibilidadesDelDia.length > 0 &&
      !estaDentroDeDisponibilidad(disponibilidadesDelDia, inicio, fin)
    ) {
      setAlertFueraDisp(true);
      return;
    }

    ejecutarGuardado();
  }

  function handleEliminar() {
    if (!turnoExistente) return;
    if (window.confirm('¿Eliminar este turno? Esta acción se puede revertir desde la base de datos.')) {
      eliminarMutation.mutate(turnoExistente.id, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px] w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modoEditar ? 'Editar turno' : 'Nuevo turno'}
            </DialogTitle>
            <DialogDescription>
              {modoEditar
                ? 'Modificá los datos del turno seleccionado.'
                : 'Completá los datos para agendar un nuevo turno.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Paciente */}
            <div className="space-y-2">
              <Label htmlFor="modal-turno-paciente">Paciente *</Label>
              <BuscadorPaciente
                value={pacienteId}
                onChange={(id, paciente) => {
                  setPacienteId(id);
                  setPacienteInicial({ id: paciente.id, nombre: paciente.nombre, apellido: paciente.apellido, telefono: paciente.telefono });
                }}
                pacienteInicial={pacienteInicial}
                disabled={isSaving}
              />
            </div>

            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="modal-turno-servicio">Servicio</Label>
              <Select
                value={servicioId || '__none__'}
                onValueChange={handleServicioChange}
                disabled={isSaving}
              >
                <SelectTrigger id="modal-turno-servicio">
                  <SelectValue placeholder="Sin servicio asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin servicio asignado</SelectItem>
                  {serviciosActivos.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        {s.color && (
                          <span
                            className="inline-block w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                        )}
                        {s.nombre}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({s.duracion_min} min)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha + Hora */}
            <div className="grid grid-cols-2 gap-3">
              {/* Fecha */}
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isSaving}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !fecha && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, 'dd/MM/yyyy', { locale: es }) : 'Elegir fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={d => d && setFecha(d)}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hora inicio */}
              <div className="space-y-2">
                <Label htmlFor="modal-turno-hora">Hora inicio *</Label>
                <Select
                  value={horaInicio}
                  onValueChange={setHoraInicio}
                  disabled={isSaving}
                >
                  <SelectTrigger id="modal-turno-hora">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horasDisponibles.map(h => (
                      <SelectItem key={h.valor} value={h.valor}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duración + Hora fin */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="modal-turno-duracion">Duración (min)</Label>
                <Input
                  id="modal-turno-duracion"
                  type="number"
                  min={DURACION_MIN}
                  step={5}
                  value={duracionMin}
                  onChange={e => handleDuracionChange(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora fin</Label>
                <div className="flex items-center h-9 px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
                  {horaFinLabel}
                </div>
              </div>
            </div>

            {/* Estado (solo en modo editar) */}
            {modoEditar && (
              <div className="space-y-2">
                <Label htmlFor="modal-turno-estado">Estado</Label>
                <Select
                  value={estado}
                  onValueChange={v => setEstado(v as EstadoTurno)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="modal-turno-estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_TURNO.map(e => (
                      <SelectItem key={e} value={e}>
                        {LABEL_ESTADO[e]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="modal-turno-notas">Notas</Label>
              <Textarea
                id="modal-turno-notas"
                value={notas}
                onChange={e => setNotas(e.target.value.slice(0, 500))}
                placeholder="Observaciones sobre el turno..."
                rows={3}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notas.length}/500
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            {modoEditar && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleEliminar}
                disabled={isSaving}
                className="sm:mr-auto w-full sm:w-auto"
              >
                Eliminar
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || !pacienteId}
                className="flex-1 sm:flex-none"
              >
                {modoEditar ? 'Guardar' : 'Crear turno'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: turno fuera de disponibilidad */}
      <AlertDialog open={alertFueraDisp} onOpenChange={setAlertFueraDisp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turno fuera del horario de atención</AlertDialogTitle>
            <AlertDialogDescription>
              Este turno está fuera de tu horario de atención marcado.
              ¿Querés crearlo de todas formas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setAlertFueraDisp(false);
              ejecutarGuardado();
            }}>
              {modoEditar ? 'Guardar igual' : 'Crear igual'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
