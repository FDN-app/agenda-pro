import { startOfWeek, endOfWeek, addWeeks, addDays, isSameDay, format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export const HORA_INICIO = 8;
export const HORA_FIN = 21;
export const MINUTOS_SLOT = 15;

export function inicioDeSemana(fecha: Date): Date {
  return startOfWeek(startOfDay(fecha), { weekStartsOn: 1 }); // 1 = Lunes
}

export function finDeSemana(fecha: Date): Date {
  // endOfWeek con weekStartsOn: 1 devuelve el domingo a las 23:59:59.
  // Pero el requerimiento dice "sábado (23:59:59)".
  // Entonces calculamos el lunes y le sumamos 5 días (hasta el sábado) al final del día
  const lunes = inicioDeSemana(fecha);
  const sabado = addDays(lunes, 5);
  sabado.setHours(23, 59, 59, 999);
  return sabado;
}

export function moverSemanas(fecha: Date, cantidad: number): Date {
  return addWeeks(fecha, cantidad);
}

export function diasDeSemana(inicio: Date): Date[] {
  return Array.from({ length: 6 }).map((_, i) => addDays(inicioDeSemana(inicio), i));
}

export function franjasHorarias(): Array<{ hora: string; minutos: number; etiquetaVisible: boolean }> {
  const franjas = [];
  for (let h = HORA_INICIO; h <= HORA_FIN; h++) {
    // Si la hora es 21:00, solo generamos el slot de las 21:00 en punto (fin del calendario)
    if (h === HORA_FIN) {
      franjas.push({
        hora: `${h.toString().padStart(2, '0')}:00`,
        minutos: h * 60,
        etiquetaVisible: true
      });
      break;
    }
    
    for (let m = 0; m < 60; m += MINUTOS_SLOT) {
      franjas.push({
        hora: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        minutos: h * 60 + m,
        etiquetaVisible: m === 0
      });
    }
  }
  return franjas;
}

export function formatoDiaCorto(fecha: Date, locale = 'es'): string {
  // Primera letra mayúscula
  const str = format(fecha, 'EEE d', { locale: es });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatoRangoSemana(inicio: Date, fin: Date): string {
  const mesInicio = format(inicio, 'MMMM', { locale: es });
  const mesFin = format(fin, 'MMMM', { locale: es });
  const añoInicio = format(inicio, 'yyyy');
  const añoFin = format(fin, 'yyyy');

  if (mesInicio === mesFin && añoInicio === añoFin) {
    return `${format(inicio, 'd')} de ${mesInicio} — ${format(fin, 'd')} de ${mesFin} de ${añoInicio}`;
  } else if (añoInicio === añoFin) {
    return `${format(inicio, 'd')} de ${mesInicio} — ${format(fin, 'd')} de ${mesFin} de ${añoInicio}`;
  } else {
    return `${format(inicio, 'd')} de ${mesInicio} de ${añoInicio} — ${format(fin, 'd')} de ${mesFin} de ${añoFin}`;
  }
}

export function mismoDia(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}
