export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      checklist_templates: {
        Row: {
          assigned_role: Database["public"]["Enums"]["household_role"] | null
          category: string | null
          conditions: Json | null
          created_at: string
          days_before_move: number | null
          description: string | null
          id: string
          phase: Database["public"]["Enums"]["task_phase"]
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_role?: Database["public"]["Enums"]["household_role"] | null
          category?: string | null
          conditions?: Json | null
          created_at?: string
          days_before_move?: number | null
          description?: string | null
          id?: string
          phase: Database["public"]["Enums"]["task_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_role?: Database["public"]["Enums"]["household_role"] | null
          category?: string | null
          conditions?: Json | null
          created_at?: string
          days_before_move?: number | null
          description?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["task_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          created_at: string
          email: string | null
          household_id: string
          id: string
          invited_at: string | null
          is_owner: boolean
          joined_at: string | null
          name: string
          role: Database["public"]["Enums"]["household_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          household_id: string
          id?: string
          invited_at?: string | null
          is_owner?: boolean
          joined_at?: string | null
          name: string
          role?: Database["public"]["Enums"]["household_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          household_id?: string
          id?: string
          invited_at?: string | null
          is_owner?: boolean
          joined_at?: string | null
          name?: string
          role?: Database["public"]["Enums"]["household_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          children_count: number
          created_at: string
          created_by: string
          household_size: number
          id: string
          invitation_code: string
          move_date: string
          name: string
          pets_count: number
          postal_code: string | null
          old_address: string | null
          new_address: string | null
          living_space: number | null
          rooms: number | null
          furniture_volume: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          children_count?: number
          created_at?: string
          created_by: string
          household_size?: number
          id?: string
          invitation_code: string
          move_date: string
          name: string
          pets_count?: number
          postal_code?: string | null
          old_address?: string | null
          new_address?: string | null
          living_space?: number | null
          rooms?: number | null
          furniture_volume?: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          children_count?: number
          created_at?: string
          created_by?: string
          household_size?: number
          id?: string
          invitation_code?: string
          move_date?: string
          name?: string
          pets_count?: number
          postal_code?: string | null
          old_address?: string | null
          new_address?: string | null
          living_space?: number | null
          rooms?: number | null
          furniture_volume?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          household_id: string
          id: string
          notes: string | null
          phase: Database["public"]["Enums"]["task_phase"]
          priority: Database["public"]["Enums"]["task_priority"]
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          household_id: string
          id?: string
          notes?: string | null
          phase: Database["public"]["Enums"]["task_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          household_id?: string
          id?: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["task_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "household_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_initial_tasks: {
        Args: { p_household_id: string }
        Returns: number
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      join_household_by_code: {
        Args: {
          p_invitation_code: string
          p_user_id: string
          p_user_name: string
          p_user_email: string
        }
        Returns: string
      }
      user_is_household_member: {
        Args: { p_household_id: string }
        Returns: boolean
      }
      user_is_household_owner: {
        Args: { p_household_id: string }
        Returns: boolean
      }
    }
    Enums: {
      household_role:
        | "vertragsmanager"
        | "packbeauftragte"
        | "finanzperson"
        | "renovierer"
        | "haustierverantwortliche"
      property_type: "miete" | "eigentum"
      task_phase: "vor_umzug" | "umzugstag" | "nach_umzug" | "langzeit"
      task_priority: "niedrig" | "mittel" | "hoch" | "kritisch"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      household_role: [
        "vertragsmanager",
        "packbeauftragte",
        "finanzperson",
        "renovierer",
        "haustierverantwortliche",
      ],
      property_type: ["miete", "eigentum"],
      task_phase: ["vor_umzug", "umzugstag", "nach_umzug", "langzeit"],
      task_priority: ["niedrig", "mittel", "hoch", "kritisch"],
    },
  },
} as const
