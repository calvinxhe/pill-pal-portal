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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cgm_encounters: {
        Row: {
          app_pairing_verified: boolean | null
          copay_amount: number | null
          created_at: string
          data_sync_verified: boolean | null
          ended_at: string | null
          id: string
          notes: string | null
          patient_id: string
          refill_reminder_given: boolean | null
          sensor_serial_number: string | null
          staff_user_id: string
          started_at: string
          status: Database["public"]["Enums"]["encounter_status"]
          total_duration_seconds: number | null
          updated_at: string
        }
        Insert: {
          app_pairing_verified?: boolean | null
          copay_amount?: number | null
          created_at?: string
          data_sync_verified?: boolean | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          refill_reminder_given?: boolean | null
          sensor_serial_number?: string | null
          staff_user_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["encounter_status"]
          total_duration_seconds?: number | null
          updated_at?: string
        }
        Update: {
          app_pairing_verified?: boolean | null
          copay_amount?: number | null
          created_at?: string
          data_sync_verified?: boolean | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          refill_reminder_given?: boolean | null
          sensor_serial_number?: string | null
          staff_user_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["encounter_status"]
          total_duration_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cgm_encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_checklist_items: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          encounter_id: string
          id: string
          notes: string | null
          step_key: string
          step_label: string
          step_order: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          encounter_id: string
          id?: string
          notes?: string | null
          step_key: string
          step_label: string
          step_order: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          encounter_id?: string
          id?: string
          notes?: string | null
          step_key?: string
          step_label?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "encounter_checklist_items_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "cgm_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_queue: {
        Row: {
          called_at: string | null
          created_at: string
          created_by: string
          id: string
          intake_form_completed: boolean | null
          patient_id: string
          queue_position: number
          queued_at: string
          status: Database["public"]["Enums"]["queue_status"]
        }
        Insert: {
          called_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          intake_form_completed?: boolean | null
          patient_id: string
          queue_position: number
          queued_at?: string
          status?: Database["public"]["Enums"]["queue_status"]
        }
        Update: {
          called_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          intake_form_completed?: boolean | null
          patient_id?: string
          queue_position?: number
          queued_at?: string
          status?: Database["public"]["Enums"]["queue_status"]
        }
        Relationships: [
          {
            foreignKeyName: "patient_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          cgm_prescription_active: boolean | null
          city: string | null
          consent_form_signed: boolean | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          freestyle_libre_app_installed: boolean | null
          id: string
          insurance_cgm_coverage_verified: boolean | null
          insurance_member_id: string | null
          insurance_provider: string | null
          last_name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          cgm_prescription_active?: boolean | null
          city?: string | null
          consent_form_signed?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          freestyle_libre_app_installed?: boolean | null
          id?: string
          insurance_cgm_coverage_verified?: boolean | null
          insurance_member_id?: string | null
          insurance_provider?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          cgm_prescription_active?: boolean | null
          city?: string | null
          consent_form_signed?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          freestyle_libre_app_installed?: boolean | null
          id?: string
          insurance_cgm_coverage_verified?: boolean | null
          insurance_member_id?: string | null
          insurance_provider?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      encounter_status: "in_progress" | "completed" | "cancelled"
      queue_status: "waiting" | "called" | "in_progress" | "done"
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
    Enums: {
      encounter_status: ["in_progress", "completed", "cancelled"],
      queue_status: ["waiting", "called", "in_progress", "done"],
    },
  },
} as const
