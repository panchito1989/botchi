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
      admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      botchi_identities: {
        Row: {
          age_level: string
          avatar_palette: string
          device_id: string
          language: string
          mood: string
          name: string
          personality: string
          personalization: Json
          updated_at: string
          voice: string
        }
        Insert: {
          age_level?: string
          avatar_palette?: string
          device_id: string
          language?: string
          mood?: string
          name?: string
          personality?: string
          personalization?: Json
          updated_at?: string
          voice?: string
        }
        Update: {
          age_level?: string
          avatar_palette?: string
          device_id?: string
          language?: string
          mood?: string
          name?: string
          personality?: string
          personalization?: Json
          updated_at?: string
          voice?: string
        }
        Relationships: [
          {
            foreignKeyName: "botchi_identities_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: true
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_heatmap: {
        Row: {
          category: string
          date: string
          device_id: string
          id: string
          score: number
        }
        Insert: {
          category: string
          date?: string
          device_id: string
          id?: string
          score?: number
        }
        Update: {
          category?: string
          date?: string
          device_id?: string
          id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_heatmap_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_interests: {
        Row: {
          device_id: string
          id: string
          source: string
          topic: string
          updated_at: string
          weight: number
        }
        Insert: {
          device_id: string
          id?: string
          source?: string
          topic: string
          updated_at?: string
          weight?: number
        }
        Update: {
          device_id?: string
          id?: string
          source?: string
          topic?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "device_interests_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_modules: {
        Row: {
          device_id: string
          enabled: boolean
          enabled_at: string
          id: string
          module_id: string
        }
        Insert: {
          device_id: string
          enabled?: boolean
          enabled_at?: string
          id?: string
          module_id: string
        }
        Update: {
          device_id?: string
          enabled?: boolean
          enabled_at?: string
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_modules_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          config_version: number
          created_at: string
          device_token: string
          firmware_version: string | null
          hardware_label: string | null
          id: string
          last_seen: string | null
          paired_at: string | null
          pairing_code: string
          parent_id: string | null
        }
        Insert: {
          config_version?: number
          created_at?: string
          device_token?: string
          firmware_version?: string | null
          hardware_label?: string | null
          id?: string
          last_seen?: string | null
          paired_at?: string | null
          pairing_code: string
          parent_id?: string | null
        }
        Update: {
          config_version?: number
          created_at?: string
          device_token?: string
          firmware_version?: string | null
          hardware_label?: string | null
          id?: string
          last_seen?: string | null
          paired_at?: string | null
          pairing_code?: string
          parent_id?: string | null
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          description: string | null
          id: string
          is_premium: boolean
          min_tier: string | null
          name: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id: string
          is_premium?: boolean
          min_tier?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          is_premium?: boolean
          min_tier?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_min_tier_fkey"
            columns: ["min_tier"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          created_at: string
          date: string
          device_id: string
          id: string
          minutes_active: number
          sessions: number
          words_learned: number
        }
        Insert: {
          created_at?: string
          date?: string
          device_id: string
          id?: string
          minutes_active?: number
          sessions?: number
          words_learned?: number
        }
        Update: {
          created_at?: string
          date?: string
          device_id?: string
          id?: string
          minutes_active?: number
          sessions?: number
          words_learned?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      prompt_profiles: {
        Row: {
          params: Json
          system_prompt: string
          tier_id: string
          updated_at: string
          version: number
        }
        Insert: {
          params?: Json
          system_prompt: string
          tier_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          params?: Json
          system_prompt?: string
          tier_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_profiles_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: true
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          created_at: string
          email: string
          hijo_edad: string | null
          id: string
          mensaje: string | null
          nombre: string
          plan: string
          source: string
          status: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          hijo_edad?: string | null
          id?: string
          mensaje?: string | null
          nombre: string
          plan?: string
          source?: string
          status?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          hijo_edad?: string | null
          id?: string
          mensaje?: string | null
          nombre?: string
          plan?: string
          source?: string
          status?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      retos: {
        Row: {
          aceptado_at: string | null
          cerrado_at: string | null
          created_at: string
          device_id: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          meta_desc: string
          meta_progreso: number
          meta_target: number
          meta_tipo: string
          parent_id: string
          premio: string
          premio_entregado_at: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aceptado_at?: string | null
          cerrado_at?: string | null
          created_at?: string
          device_id: string
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          meta_desc: string
          meta_progreso?: number
          meta_target?: number
          meta_tipo?: string
          parent_id: string
          premio: string
          premio_entregado_at?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          aceptado_at?: string | null
          cerrado_at?: string | null
          created_at?: string
          device_id?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          meta_desc?: string
          meta_progreso?: number
          meta_target?: number
          meta_tipo?: string
          parent_id?: string
          premio?: string
          premio_entregado_at?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retos_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          description: string | null
          id: string
          is_premium: boolean
          max_age: number | null
          min_age: number | null
          name: string
          price_mxn: number
          sort_order: number
        }
        Insert: {
          description?: string | null
          id: string
          is_premium?: boolean
          max_age?: number | null
          min_age?: number | null
          name: string
          price_mxn?: number
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          is_premium?: boolean
          max_age?: number | null
          min_age?: number | null
          name?: string
          price_mxn?: number
          sort_order?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          id: string
          parent_id: string
          started_at: string
          status: string
          tier_id: string
        }
        Insert: {
          current_period_end?: string | null
          id?: string
          parent_id: string
          started_at?: string
          status?: string
          tier_id?: string
        }
        Update: {
          current_period_end?: string | null
          id?: string
          parent_id?: string
          started_at?: string
          status?: string
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_reto_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      claim_device: { Args: { p_code: string }; Returns: string }
      crear_reserva: {
        Args: {
          p_email: string
          p_hijo_edad?: string
          p_mensaje?: string
          p_nombre: string
          p_plan?: string
          p_source?: string
          p_whatsapp?: string
        }
        Returns: string
      }
      crear_reto: {
        Args: {
          p_device_id: string
          p_meta_desc: string
          p_meta_target: number
          p_meta_tipo: string
          p_plazo_dias: number
          p_premio: string
          p_titulo: string
        }
        Returns: string
      }
      device_config: { Args: { p_token: string }; Returns: Json }
      device_heartbeat: {
        Args: { p_firmware?: string; p_token: string }
        Returns: Json
      }
      device_push_progress: {
        Args: {
          p_heatmap?: Json
          p_interests?: Json
          p_minutes?: number
          p_sessions?: number
          p_token: string
          p_words?: number
        }
        Returns: Json
      }
      es_admin: { Args: never; Returns: boolean }
      incrementar_progreso_reto: {
        Args: { p_delta: number; p_id: string }
        Returns: number
      }
      listar_reservas: { Args: never; Returns: Json }
      marcar_premio_entregado: { Args: { p_id: string }; Returns: undefined }
      marcar_reserva: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      owns_device: { Args: { d: string }; Returns: boolean }
      rate_limit_hit: {
        Args: {
          p_bucket: string
          p_max: number
          p_subject: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      seed_demo_progress: { Args: { p_device_id: string }; Returns: undefined }
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
