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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      case_audits: {
        Row: {
          case_id: string
          changed_at: string
          changed_by: string
          diff: Json | null
          id: string
        }
        Insert: {
          case_id: string
          changed_at?: string
          changed_by: string
          diff?: Json | null
          id?: string
        }
        Update: {
          case_id?: string
          changed_at?: string
          changed_by?: string
          diff?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_audits_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          confirmed: boolean | null
          created_at: string
          dehydration_level: number | null
          disease_id: string
          household_id: string
          id: string
          lab: Json | null
          lat: number | null
          lon: number | null
          notes: string | null
          onset_date: string | null
          outcome: Database["public"]["Enums"]["outcome"] | null
          person_id: string | null
          report_date: string
          reporter_id: string | null
          severity: Database["public"]["Enums"]["severity"] | null
          source: Database["public"]["Enums"]["source"] | null
          symptoms: Json | null
          temperature_c: number | null
          updated_at: string
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          dehydration_level?: number | null
          disease_id: string
          household_id: string
          id?: string
          lab?: Json | null
          lat?: number | null
          lon?: number | null
          notes?: string | null
          onset_date?: string | null
          outcome?: Database["public"]["Enums"]["outcome"] | null
          person_id?: string | null
          report_date: string
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["severity"] | null
          source?: Database["public"]["Enums"]["source"] | null
          symptoms?: Json | null
          temperature_c?: number | null
          updated_at?: string
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          dehydration_level?: number | null
          disease_id?: string
          household_id?: string
          id?: string
          lab?: Json | null
          lat?: number | null
          lon?: number | null
          notes?: string | null
          onset_date?: string | null
          outcome?: Database["public"]["Enums"]["outcome"] | null
          person_id?: string | null
          report_date?: string
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["severity"] | null
          source?: Database["public"]["Enums"]["source"] | null
          symptoms?: Json | null
          temperature_c?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      diseases: {
        Row: {
          created_at: string
          default_symptoms: Json | null
          icd_code: string | null
          id: string
          name: string
          updated_at: string
          vector_borne: boolean | null
        }
        Insert: {
          created_at?: string
          default_symptoms?: Json | null
          icd_code?: string | null
          id?: string
          name: string
          updated_at?: string
          vector_borne?: boolean | null
        }
        Update: {
          created_at?: string
          default_symptoms?: Json | null
          icd_code?: string | null
          id?: string
          name?: string
          updated_at?: string
          vector_borne?: boolean | null
        }
        Relationships: []
      }
      households: {
        Row: {
          created_at: string
          household_code: string
          id: string
          location_id: string
          members_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          household_code: string
          id?: string
          location_id: string
          members_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          household_code?: string
          id?: string
          location_id?: string
          members_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          region_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          region_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          consent: boolean | null
          created_at: string
          email_enc: string | null
          household_id: string
          id: string
          phone_enc: string | null
          sex: Database["public"]["Enums"]["sex"] | null
          updated_at: string
          year_of_birth: number | null
        }
        Insert: {
          consent?: boolean | null
          created_at?: string
          email_enc?: string | null
          household_id: string
          id?: string
          phone_enc?: string | null
          sex?: Database["public"]["Enums"]["sex"] | null
          updated_at?: string
          year_of_birth?: number | null
        }
        Update: {
          consent?: boolean | null
          created_at?: string
          email_enc?: string | null
          household_id?: string
          id?: string
          phone_enc?: string | null
          sex?: Database["public"]["Enums"]["sex"] | null
          updated_at?: string
          year_of_birth?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "persons_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          region_scope: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          region_scope?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          region_scope?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "officer" | "viewer"
      outcome: "active" | "recovered" | "deceased"
      severity: "mild" | "moderate" | "severe"
      sex: "M" | "F" | "O"
      source: "clinic" | "camp" | "survey" | "self_report"
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
      app_role: ["admin", "officer", "viewer"],
      outcome: ["active", "recovered", "deceased"],
      severity: ["mild", "moderate", "severe"],
      sex: ["M", "F", "O"],
      source: ["clinic", "camp", "survey", "self_report"],
    },
  },
} as const
