export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agreements: {
        Row: {
          content: string | null
          created_at: string
          document_url: string | null
          id: string
          pharmacy_id: string
          signed_at: string | null
          signed_by: string | null
          title: string
          type: Database["public"]["Enums"]["agreement_type"]
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          pharmacy_id: string
          signed_at?: string | null
          signed_by?: string | null
          title: string
          type: Database["public"]["Enums"]["agreement_type"]
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          pharmacy_id?: string
          signed_at?: string | null
          signed_by?: string | null
          title?: string
          type?: Database["public"]["Enums"]["agreement_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreements_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          search_vector: unknown | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          assigned_to: string | null
          claim_submitted_at: string | null
          created_at: string
          created_by: string | null
          delivered_at: string | null
          device_serial: string | null
          device_type: string
          id: string
          notes: string | null
          order_source: string | null
          patient_id: string | null
          pharmacy_id: string
          reimbursement_amount: number | null
          shipped_at: string | null
          shipping_label_url: string | null
          status: Database["public"]["Enums"]["order_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          claim_submitted_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          device_serial?: string | null
          device_type: string
          id?: string
          notes?: string | null
          order_source?: string | null
          patient_id?: string | null
          pharmacy_id: string
          reimbursement_amount?: number | null
          shipped_at?: string | null
          shipping_label_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          claim_submitted_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          device_serial?: string | null
          device_type?: string
          id?: string
          notes?: string | null
          order_source?: string | null
          patient_id?: string | null
          pharmacy_id?: string
          reimbursement_amount?: number | null
          shipped_at?: string | null
          shipping_label_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_adherence: {
        Row: {
          benchmark_met: boolean | null
          created_at: string
          id: string
          last_reading_date: string | null
          month_year: string
          order_id: string
          patient_id: string
          readings_count: number | null
          updated_at: string
        }
        Insert: {
          benchmark_met?: boolean | null
          created_at?: string
          id?: string
          last_reading_date?: string | null
          month_year: string
          order_id: string
          patient_id: string
          readings_count?: number | null
          updated_at?: string
        }
        Update: {
          benchmark_met?: boolean | null
          created_at?: string
          id?: string
          last_reading_date?: string | null
          month_year?: string
          order_id?: string
          patient_id?: string
          readings_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_adherence_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_adherence_patient_id_fkey"
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
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          insurance_info: Json | null
          last_name: string
          phone: string | null
          referring_provider: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          insurance_info?: Json | null
          last_name: string
          phone?: string | null
          referring_provider?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          insurance_info?: Json | null
          last_name?: string
          phone?: string | null
          referring_provider?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          address: string | null
          bank_account_info: Json | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          license_number: string | null
          name: string
          npi: string | null
          phone: string | null
          state: string | null
          territory_zip_codes: string[] | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bank_account_info?: Json | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          name: string
          npi?: string | null
          phone?: string | null
          state?: string | null
          territory_zip_codes?: string[] | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bank_account_info?: Json | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          name?: string
          npi?: string | null
          phone?: string | null
          state?: string | null
          territory_zip_codes?: string[] | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          pharmacy_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          pharmacy_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          pharmacy_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_tracking: {
        Row: {
          amount: number
          created_at: string
          fee_type: string
          id: string
          manager_share: number | null
          order_id: string | null
          period_end: string | null
          period_start: string | null
          pharmacy_id: string
          ticket_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          fee_type: string
          id?: string
          manager_share?: number | null
          order_id?: string | null
          period_end?: string | null
          period_start?: string | null
          pharmacy_id: string
          ticket_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          fee_type?: string
          id?: string
          manager_share?: number | null
          order_id?: string | null
          period_end?: string | null
          period_start?: string | null
          pharmacy_id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_tracking_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_tracking_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          escalated_at: string | null
          id: string
          patient_id: string
          pharmacy_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          transaction_fee: number | null
          type: Database["public"]["Enums"]["ticket_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          escalated_at?: string | null
          id?: string
          patient_id: string
          pharmacy_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          transaction_fee?: number | null
          type: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          escalated_at?: string | null
          id?: string
          patient_id?: string
          pharmacy_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          transaction_fee?: number | null
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          notes: string | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          notes?: string | null
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          notes?: string | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_interactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          is_required: boolean | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          pharmacy_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          pharmacy_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          pharmacy_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_training_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          progress_percentage: number | null
          status: Database["public"]["Enums"]["training_status"]
          training_module_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          training_module_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          training_module_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_training_progress_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_pharmacy: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      agreement_type:
        | "master_agreement"
        | "baa"
        | "exclusivity"
        | "territory_lease"
      order_status:
        | "pending"
        | "assigned"
        | "shipped"
        | "delivered"
        | "cancelled"
      ticket_status:
        | "open"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "escalated"
      ticket_type:
        | "lost_device"
        | "damaged_device"
        | "setup_help"
        | "troubleshooting"
        | "other"
      training_status: "not_started" | "in_progress" | "completed"
      user_role:
        | "admin"
        | "pharmacist"
        | "technician"
        | "support_staff"
        | "manager"
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
      agreement_type: [
        "master_agreement",
        "baa",
        "exclusivity",
        "territory_lease",
      ],
      order_status: [
        "pending",
        "assigned",
        "shipped",
        "delivered",
        "cancelled",
      ],
      ticket_status: [
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "escalated",
      ],
      ticket_type: [
        "lost_device",
        "damaged_device",
        "setup_help",
        "troubleshooting",
        "other",
      ],
      training_status: ["not_started", "in_progress", "completed"],
      user_role: [
        "admin",
        "pharmacist",
        "technician",
        "support_staff",
        "manager",
      ],
    },
  },
} as const
