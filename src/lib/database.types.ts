export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          nombre: string
          rol: 'admin' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre: string
          rol: 'admin' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          rol?: 'admin' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          nombre: string
          apellido: string
          telefono: string
          dni: string | null
          obra_social: string | null
          observaciones: string | null
          estado: 'nuevo' | 'activo' | 'bloqueado'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          apellido: string
          telefono: string
          dni?: string | null
          obra_social?: string | null
          observaciones?: string | null
          estado?: 'nuevo' | 'activo' | 'bloqueado'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          apellido?: string
          telefono?: string
          dni?: string | null
          obra_social?: string | null
          observaciones?: string | null
          estado?: 'nuevo' | 'activo' | 'bloqueado'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      servicios: {
        Row: {
          id: string
          nombre: string
          duracion_min: number
          color: string | null
          activo: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          duracion_min: number
          color?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          duracion_min?: number
          color?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      turnos: {
        Row: {
          id: string
          paciente_id: string
          servicio_id: string | null
          inicio_at: string
          fin_at: string
          notas: string | null
          estado: 'pendiente' | 'verificado' | 'cancelado' | 'no-show'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          paciente_id: string
          servicio_id?: string | null
          inicio_at: string
          fin_at: string
          notas?: string | null
          estado?: 'pendiente' | 'verificado' | 'cancelado' | 'no-show'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          paciente_id?: string
          servicio_id?: string | null
          inicio_at?: string
          fin_at?: string
          notas?: string | null
          estado?: 'pendiente' | 'verificado' | 'cancelado' | 'no-show'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      solicitudes: {
        Row: {
          id: string
          telefono: string
          paciente_id: string | null
          servicio_id: string | null
          mensaje_consulta: string | null
          tipo: 'turno_nuevo' | 'consulta_previa'
          estado: 'pendiente' | 'aprobada' | 'descartada'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telefono: string
          paciente_id?: string | null
          servicio_id?: string | null
          mensaje_consulta?: string | null
          tipo: 'turno_nuevo' | 'consulta_previa'
          estado?: 'pendiente' | 'aprobada' | 'descartada'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telefono?: string
          paciente_id?: string | null
          servicio_id?: string | null
          mensaje_consulta?: string | null
          tipo?: 'turno_nuevo' | 'consulta_previa'
          estado?: 'pendiente' | 'aprobada' | 'descartada'
          created_at?: string
          updated_at?: string
        }
      }
      configuracion: {
        Row: {
          id: string
          nombre_consultorio: string
          horarios_atencion: Json
          plantillas_mensajes: Json
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_consultorio?: string
          horarios_atencion?: Json
          plantillas_mensajes?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_consultorio?: string
          horarios_atencion?: Json
          plantillas_mensajes?: Json
          updated_at?: string
        }
      }
    }
  }
}
