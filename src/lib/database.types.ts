export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocked_slots: {
        Row: {
          created_at: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          motivo: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          motivo?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          motivo?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_slots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion: {
        Row: {
          horarios_atencion: Json | null
          id: string
          nombre_consultorio: string
          plantillas_mensajes: Json | null
          updated_at: string
        }
        Insert: {
          horarios_atencion?: Json | null
          id?: string
          nombre_consultorio?: string
          plantillas_mensajes?: Json | null
          updated_at?: string
        }
        Update: {
          horarios_atencion?: Json | null
          id?: string
          nombre_consultorio?: string
          plantillas_mensajes?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      disponibilidades: {
        Row: {
          created_at: string
          deleted_at: string | null
          fin_at: string
          id: string
          inicio_at: string
          notas: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fin_at: string
          id?: string
          inicio_at: string
          notas?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fin_at?: string
          id?: string
          inicio_at?: string
          notas?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          contenido: string
          created_at: string | null
          id: string
          nombre: string
          profile_id: string
        }
        Insert: {
          contenido: string
          created_at?: string | null
          id?: string
          nombre: string
          profile_id: string
        }
        Update: {
          contenido?: string
          created_at?: string | null
          id?: string
          nombre?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          apellido: string
          created_at: string
          deleted_at: string | null
          dni: string | null
          estado: string
          id: string
          nombre: string
          obra_social: string | null
          observaciones: string | null
          telefono: string
          updated_at: string
        }
        Insert: {
          apellido: string
          created_at?: string
          deleted_at?: string | null
          dni?: string | null
          estado?: string
          id?: string
          nombre: string
          obra_social?: string | null
          observaciones?: string | null
          telefono: string
          updated_at?: string
        }
        Update: {
          apellido?: string
          created_at?: string
          deleted_at?: string | null
          dni?: string | null
          estado?: string
          id?: string
          nombre?: string
          obra_social?: string | null
          observaciones?: string | null
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          created_at: string
          id: string
          nombre: string
          rol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nombre: string
          rol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          rol?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consultorio_nombre: string | null
          created_at: string | null
          direccion: string | null
          id: string
          nombre: string
          telefono: string | null
        }
        Insert: {
          consultorio_nombre?: string | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre: string
          telefono?: string | null
        }
        Update: {
          consultorio_nombre?: string | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      servicios: {
        Row: {
          activo: boolean | null
          color: string | null
          created_at: string
          deleted_at: string | null
          duracion_min: number
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          duracion_min: number
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          duracion_min?: number
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      solicitudes: {
        Row: {
          created_at: string
          estado: string
          id: string
          mensaje_consulta: string | null
          paciente_id: string | null
          servicio_id: string | null
          telefono: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: string
          mensaje_consulta?: string | null
          paciente_id?: string | null
          servicio_id?: string | null
          telefono: string
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: string
          id?: string
          mensaje_consulta?: string | null
          paciente_id?: string | null
          servicio_id?: string | null
          telefono?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          created_at: string
          deleted_at: string | null
          estado: string
          fin_at: string
          id: string
          inicio_at: string
          notas: string | null
          paciente_id: string
          servicio_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          estado?: string
          fin_at: string
          id?: string
          inicio_at: string
          notas?: string | null
          paciente_id: string
          servicio_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          estado?: string
          fin_at?: string
          id?: string
          inicio_at?: string
          notas?: string | null
          paciente_id?: string
          servicio_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          activo: boolean | null
          desde: string | null
          dia: string
          hasta: string | null
          id: string
          profile_id: string
        }
        Insert: {
          activo?: boolean | null
          desde?: string | null
          dia: string
          hasta?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          activo?: boolean | null
          desde?: string | null
          dia?: string
          hasta?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
