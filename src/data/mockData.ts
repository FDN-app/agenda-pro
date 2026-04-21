export type EstadoTurno =
  | "solicitud_pendiente"
  | "consulta_previa"
  | "agendado"
  | "confirmado"
  | "completado"
  | "cancelado"
  | "no_vino"
  | "bloqueado";

export type EstadoPaciente = "nuevo" | "activo" | "bloqueado";

export interface Servicio {
  id: string;
  nombre: string;
  duracionMin: number;
  precio: number;
  activo: boolean;
}

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  obraSocial: string;
  dni?: string;
  estado: EstadoPaciente;
  observaciones: string;
  ultimoTurno?: string;
}

export interface Turno {
  id: string;
  pacienteId: string;
  servicioId: string;
  fecha: string; // ISO yyyy-mm-dd
  hora: string; // HH:mm
  duracionMin: number;
  estado: EstadoTurno;
  aclaracion?: string;
  notasDentista?: string;
}

export interface SolicitudNueva {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  obraSocial: string;
  servicioId: string;
  fecha: string;
  hora: string;
  aclaracion?: string;
}

export interface ConsultaPrevia {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  obraSocial: string;
  mensaje: string;
  fechaRecibida: string;
}

export interface PlantillaMensaje {
  id: string;
  nombre: string;
  contenido: string;
}

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const servicios: Servicio[] = [
  { id: "s1", nombre: "Consulta", duracionMin: 20, precio: 15000, activo: true },
  { id: "s2", nombre: "Limpieza", duracionMin: 30, precio: 25000, activo: true },
  { id: "s3", nombre: "Arreglo de caries", duracionMin: 45, precio: 35000, activo: true },
  { id: "s4", nombre: "Extracción simple", duracionMin: 60, precio: 45000, activo: true },
  { id: "s5", nombre: "Conducto", duracionMin: 90, precio: 80000, activo: true },
];

const obrasSociales = ["OSDE", "Swiss Medical", "Galeno", "IOMA", "Particular", "PAMI"];
const nombres = [
  ["Juan", "Pérez"], ["María", "González"], ["Sofía", "Fernández"], ["Lautaro", "Gómez"],
  ["Camila", "Rodríguez"], ["Mateo", "López"], ["Valentina", "Martínez"], ["Tomás", "Sánchez"],
  ["Lucía", "Romero"], ["Benjamín", "Díaz"], ["Martina", "Álvarez"], ["Bautista", "Torres"],
  ["Catalina", "Ruiz"], ["Joaquín", "Ramírez"], ["Isabella", "Flores"], ["Thiago", "Acosta"],
  ["Mía", "Benítez"], ["Felipe", "Medina"], ["Emma", "Herrera"], ["Santino", "Castro"],
];

const tel = (i: number) => `+54 9 11 ${4000 + i * 13}-${1000 + i * 7}`;

export const pacientes: Paciente[] = nombres.map(([n, a], i) => ({
  id: `p${i + 1}`,
  nombre: n,
  apellido: a,
  telefono: tel(i),
  obraSocial: obrasSociales[i % obrasSociales.length],
  estado: i < 2 ? "nuevo" : i === 19 ? "bloqueado" : "activo",
  observaciones: i === 3 ? "Paciente ansiosa, manejar con calma." : i === 7 ? "Alérgica a penicilina." : "",
  ultimoTurno: addDays(-Math.floor(Math.random() * 30)),
}));

const horasDia = ["09:00", "09:30", "10:30", "11:00", "14:00", "15:00", "16:30", "17:30"];
const estados: EstadoTurno[] = ["agendado", "confirmado", "completado", "cancelado", "no_vino"];

export const turnos: Turno[] = [];
let tid = 1;

// Hoy: 6 turnos
["09:00", "10:00", "11:00", "14:30", "16:00", "17:30"].forEach((h, i) => {
  const serv = servicios[i % servicios.length];
  turnos.push({
    id: `t${tid++}`,
    pacienteId: pacientes[i + 2].id,
    servicioId: serv.id,
    fecha: addDays(0),
    hora: h,
    duracionMin: serv.duracionMin,
    estado: i === 0 ? "completado" : i === 1 ? "confirmado" : i === 4 ? "agendado" : "confirmado",
    aclaracion: i === 2 ? "Vengo con dolor en muela superior derecha" : undefined,
  });
});

// Próximos 7 días
for (let d = 1; d <= 7; d++) {
  const cant = 2 + (d % 3);
  for (let k = 0; k < cant; k++) {
    const serv = servicios[(d + k) % servicios.length];
    turnos.push({
      id: `t${tid++}`,
      pacienteId: pacientes[(d * 2 + k) % pacientes.length].id,
      servicioId: serv.id,
      fecha: addDays(d),
      hora: horasDia[(d + k) % horasDia.length],
      duracionMin: serv.duracionMin,
      estado: k === 0 ? "confirmado" : "agendado",
    });
  }
}

// Últimos 30 días - historial
for (let d = 1; d <= 25; d++) {
  const serv = servicios[d % servicios.length];
  turnos.push({
    id: `t${tid++}`,
    pacienteId: pacientes[d % pacientes.length].id,
    servicioId: serv.id,
    fecha: addDays(-d),
    hora: horasDia[d % horasDia.length],
    duracionMin: serv.duracionMin,
    estado: estados[d % estados.length],
    notasDentista: d % 4 === 0 ? "Trabajo realizado sin complicaciones." : undefined,
  });
}

export const solicitudesNuevas: SolicitudNueva[] = [
  {
    id: "sol1", nombre: "Florencia", apellido: "Iglesias", telefono: "+54 9 11 5523-8821",
    obraSocial: "OSDE", servicioId: "s2", fecha: addDays(2), hora: "10:00",
    aclaracion: "Hace más de un año que no me hago una limpieza.",
  },
  {
    id: "sol2", nombre: "Diego", apellido: "Maldonado", telefono: "+54 9 11 6612-3344",
    obraSocial: "Particular", servicioId: "s3", fecha: addDays(3), hora: "16:00",
  },
  {
    id: "sol3", nombre: "Agustina", apellido: "Vega", telefono: "+54 9 11 7788-9911",
    obraSocial: "Swiss Medical", servicioId: "s1", fecha: addDays(1), hora: "09:30",
    aclaracion: "Quiero consultar por blanqueamiento.",
  },
];

export const consultasPrevias: ConsultaPrevia[] = [
  {
    id: "c1", nombre: "Ramiro", apellido: "Ortiz", telefono: "+54 9 11 4455-6677",
    obraSocial: "Galeno",
    mensaje: "Hola, se me rompió un diente comiendo y me duele mucho, no sé si es urgencia. Tengo una pieza con corona vieja.",
    fechaRecibida: addDays(0),
  },
  {
    id: "c2", nombre: "Paula", apellido: "Cabrera", telefono: "+54 9 11 3322-1100",
    obraSocial: "IOMA",
    mensaje: "Buenas, hace dos días tengo una molestia en una muela cuando tomo algo frío. ¿Puede ser una caries?",
    fechaRecibida: addDays(-1),
  },
];

export const plantillasMensajes: PlantillaMensaje[] = [
  { id: "pm1", nombre: "Bienvenida a paciente nuevo",
    contenido: "¡Hola {nombre}! Soy del consultorio. Te confirmo tu turno para {fecha} a las {hora} para {servicio}. Cualquier cosa, escribime." },
  { id: "pm2", nombre: "Confirmación de turno",
    contenido: "Hola {nombre}, te confirmo tu turno: {fecha} a las {hora} - {servicio}. ¡Te espero!" },
  { id: "pm3", nombre: "Recordatorio 24hs antes",
    contenido: "¡Hola {nombre}! Te recuerdo tu turno mañana {fecha} a las {hora}. Confirmame respondiendo SI. Gracias." },
  { id: "pm4", nombre: "Consulta previa",
    contenido: "Hola {nombre}, recibí tu mensaje. Te asigné un turno para {fecha} a las {hora}. Avisame si te queda bien." },
];

export const consultorio = {
  nombre: "Dra. Lucía Fernández - Odontología",
  direccion: "Av. Rivadavia 4521, CABA",
  telefono: "+54 9 11 4567-8900",
  horarios: [
    { dia: "Lunes", desde: "09:00", hasta: "18:00" },
    { dia: "Martes", desde: "09:00", hasta: "18:00" },
    { dia: "Miércoles", desde: "09:00", hasta: "18:00" },
    { dia: "Jueves", desde: "09:00", hasta: "18:00" },
    { dia: "Viernes", desde: "09:00", hasta: "14:00" },
    { dia: "Sábado", desde: "Cerrado", hasta: "" },
    { dia: "Domingo", desde: "Cerrado", hasta: "" },
  ],
};

export const formatARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export const fechaLarga = (d: Date = new Date()) =>
  new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(d);

export const estadoConfig: Record<EstadoTurno, { label: string; className: string }> = {
  solicitud_pendiente: { label: "Pendiente", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  consulta_previa:     { label: "Consulta",  className: "bg-violet/15 text-violet border-violet/30" },
  agendado:            { label: "Agendado",  className: "bg-info/15 text-info border-info/30" },
  confirmado:          { label: "Confirmado",className: "bg-success/20 text-success-foreground border-success/40" },
  completado:          { label: "Completado",className: "bg-muted text-muted-foreground border-border" },
  cancelado:           { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/30" },
  no_vino:             { label: "No vino",   className: "bg-destructive/20 text-destructive border-destructive/40" },
  bloqueado:           { label: "Bloqueado", className: "bg-muted text-muted-foreground border-border" },
};