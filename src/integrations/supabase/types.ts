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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      box_comments: {
        Row: {
          box_id: string
          comment_text: string
          comment_type: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          box_id: string
          comment_text: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          box_id?: string
          comment_text?: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "box_comments_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      box_contents: {
        Row: {
          ai_detected: boolean | null
          box_id: string
          category: string | null
          created_at: string | null
          description: string | null
          estimated_value: number | null
          id: string
          is_fragile: boolean | null
          item_name: string
          manually_added: boolean | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          ai_detected?: boolean | null
          box_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          is_fragile?: boolean | null
          item_name: string
          manually_added?: boolean | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_detected?: boolean | null
          box_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          is_fragile?: boolean | null
          item_name?: string
          manually_added?: boolean | null
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "box_contents_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      box_locations: {
        Row: {
          box_id: string
          id: string
          is_current: boolean | null
          location_name: string
          location_type: string
          notes: string | null
          recorded_at: string | null
          recorded_by: string
          room: string | null
        }
        Insert: {
          box_id: string
          id?: string
          is_current?: boolean | null
          location_name: string
          location_type: string
          notes?: string | null
          recorded_at?: string | null
          recorded_by: string
          room?: string | null
        }
        Update: {
          box_id?: string
          id?: string
          is_current?: boolean | null
          location_name?: string
          location_type?: string
          notes?: string | null
          recorded_at?: string | null
          recorded_by?: string
          room?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "box_locations_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      box_photos: {
        Row: {
          ai_analysis: Json | null
          box_id: string
          id: string
          photo_type: string | null
          photo_url: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          ai_analysis?: Json | null
          box_id: string
          id?: string
          photo_type?: string | null
          photo_url: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          ai_analysis?: Json | null
          box_id?: string
          id?: string
          photo_type?: string | null
          photo_url?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "box_photos_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      boxes: {
        Row: {
          box_number: string
          category: Database["public"]["Enums"]["box_category"] | null
          created_at: string | null
          created_by: string
          description: string | null
          destination_household_id: string | null
          dimensions_cm: Json | null
          household_id: string
          id: string
          name: string | null
          room: string | null
          source_household_id: string | null
          status: Database["public"]["Enums"]["box_status"] | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          box_number: string
          category?: Database["public"]["Enums"]["box_category"] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          destination_household_id?: string | null
          dimensions_cm?: Json | null
          household_id: string
          id?: string
          name?: string | null
          room?: string | null
          source_household_id?: string | null
          status?: Database["public"]["Enums"]["box_status"] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          box_number?: string
          category?: Database["public"]["Enums"]["box_category"] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          destination_household_id?: string | null
          dimensions_cm?: Json | null
          household_id?: string
          id?: string
          name?: string | null
          room?: string | null
          source_household_id?: string | null
          status?: Database["public"]["Enums"]["box_status"] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boxes_destination_household_id_fkey"
            columns: ["destination_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boxes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boxes_source_household_id_fkey"
            columns: ["source_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context: Json | null
          created_at: string
          household_id: string
          id: string
          last_message_at: string
          title: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          household_id: string
          id?: string
          last_message_at?: string
          title?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          household_id?: string
          id?: string
          last_message_at?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          assigned_role: Database["public"]["Enums"]["household_role"] | null
          category: string | null
          conditions: Json | null
          created_at: string
          days_before_move: number | null
          description: string | null
          id: string
          online_form_link: string | null
          opening_hours: string | null
          phase: Database["public"]["Enums"]["task_phase"]
          priority: Database["public"]["Enums"]["task_priority"]
          required_documents: Json | null
          source_reference: string | null
          title: string
          updated_at: string
          zuständige_stelle: string | null
        }
        Insert: {
          assigned_role?: Database["public"]["Enums"]["household_role"] | null
          category?: string | null
          conditions?: Json | null
          created_at?: string
          days_before_move?: number | null
          description?: string | null
          id?: string
          online_form_link?: string | null
          opening_hours?: string | null
          phase: Database["public"]["Enums"]["task_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          required_documents?: Json | null
          source_reference?: string | null
          title: string
          updated_at?: string
          zuständige_stelle?: string | null
        }
        Update: {
          assigned_role?: Database["public"]["Enums"]["household_role"] | null
          category?: string | null
          conditions?: Json | null
          created_at?: string
          days_before_move?: number | null
          description?: string | null
          id?: string
          online_form_link?: string | null
          opening_hours?: string | null
          phase?: Database["public"]["Enums"]["task_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          required_documents?: Json | null
          source_reference?: string | null
          title?: string
          updated_at?: string
          zuständige_stelle?: string | null
        }
        Relationships: []
      }
      fim_leistungen: {
        Row: {
          beschreibung: string | null
          daten: Json | null
          fim_id: string
          last_updated: string | null
          titel: string
        }
        Insert: {
          beschreibung?: string | null
          daten?: Json | null
          fim_id: string
          last_updated?: string | null
          titel: string
        }
        Update: {
          beschreibung?: string | null
          daten?: Json | null
          fim_id?: string
          last_updated?: string | null
          titel?: string
        }
        Relationships: []
      }
      household_draft_versions: {
        Row: {
          created_at: string
          data: Json
          draft_id: string
          id: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          data: Json
          draft_id: string
          id?: string
          user_id: string
          version: number
        }
        Update: {
          created_at?: string
          data?: Json
          draft_id?: string
          id?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "household_draft_versions_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "household_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      household_drafts: {
        Row: {
          completion_percentage: number
          created_at: string
          data: Json
          id: string
          last_step: number
          status: string
          updated_at: string
          user_id: string
          validation_errors: Json | null
          version: number
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          data: Json
          id: string
          last_step?: number
          status?: string
          updated_at?: string
          user_id: string
          validation_errors?: Json | null
          version?: number
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          data?: Json
          id?: string
          last_step?: number
          status?: string
          updated_at?: string
          user_id?: string
          validation_errors?: Json | null
          version?: number
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
          furniture_volume: number | null
          household_size: number
          id: string
          important_notes: string | null
          invitation_code: string
          living_space: number | null
          move_date: string
          name: string
          new_address: string | null
          old_address: string | null
          parent_household_id: string | null
          pet_types: string | null
          pets_count: number
          postal_code: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          rooms: number | null
          updated_at: string
        }
        Insert: {
          children_count?: number
          created_at?: string
          created_by: string
          furniture_volume?: number | null
          household_size?: number
          id?: string
          important_notes?: string | null
          invitation_code: string
          living_space?: number | null
          move_date: string
          name: string
          new_address?: string | null
          old_address?: string | null
          parent_household_id?: string | null
          pet_types?: string | null
          pets_count?: number
          postal_code?: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          rooms?: number | null
          updated_at?: string
        }
        Update: {
          children_count?: number
          created_at?: string
          created_by?: string
          furniture_volume?: number | null
          household_size?: number
          id?: string
          important_notes?: string | null
          invitation_code?: string
          living_space?: number | null
          move_date?: string
          name?: string
          new_address?: string | null
          old_address?: string | null
          parent_household_id?: string | null
          pet_types?: string | null
          pets_count?: number
          postal_code?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          rooms?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_parent_household_id_fkey"
            columns: ["parent_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      move_households: {
        Row: {
          household_id: string
          move_id: string
        }
        Insert: {
          household_id: string
          move_id: string
        }
        Update: {
          household_id?: string
          move_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_households_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_households_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "moves"
            referencedColumns: ["id"]
          },
        ]
      }
      move_members_roles: {
        Row: {
          assigned_at: string
          id: string
          move_id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          move_id: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          move_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_members_roles_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "moves"
            referencedColumns: ["id"]
          },
        ]
      }
      moves: {
        Row: {
          created_at: string
          created_by: string
          id: string
          move_date: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          move_date: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          move_date?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      premium_status: {
        Row: {
          features_enabled: Json | null
          is_premium: boolean
          premium_mode: string | null
          purchase_date: string | null
          stripe_subscription_id: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          features_enabled?: Json | null
          is_premium?: boolean
          premium_mode?: string | null
          purchase_date?: string | null
          stripe_subscription_id?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          features_enabled?: Json | null
          is_premium?: boolean
          premium_mode?: string | null
          purchase_date?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_assistant_consent: boolean | null
          ai_assistant_consent_date: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          has_children: boolean | null
          has_pets: boolean | null
          id: string
          is_self_employed: boolean | null
          owns_car: boolean | null
          updated_at: string
          wants_notifications: boolean | null
        }
        Insert: {
          ai_assistant_consent?: boolean | null
          ai_assistant_consent_date?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          has_children?: boolean | null
          has_pets?: boolean | null
          id: string
          is_self_employed?: boolean | null
          owns_car?: boolean | null
          updated_at?: string
          wants_notifications?: boolean | null
        }
        Update: {
          ai_assistant_consent?: boolean | null
          ai_assistant_consent_date?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          is_self_employed?: boolean | null
          owns_car?: boolean | null
          updated_at?: string
          wants_notifications?: boolean | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          stripe_customer_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          stripe_customer_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          stripe_customer_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_due_date: string | null
          old_due_date: string | null
          task_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_due_date?: string | null
          old_due_date?: string | null
          task_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_due_date?: string | null
          old_due_date?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          attachment_url: string | null
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
          link_url: string | null
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
          attachment_url?: string | null
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
          link_url?: string | null
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
          attachment_url?: string | null
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
          link_url?: string | null
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
      timeline_preferences: {
        Row: {
          created_at: string
          household_id: string
          id: string
          show_modules: string[] | null
          snap_to_grid: boolean
          updated_at: string
          zoom_level: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          show_modules?: string[] | null
          snap_to_grid?: boolean
          updated_at?: string
          zoom_level?: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          show_modules?: string[] | null
          snap_to_grid?: boolean
          updated_at?: string
          zoom_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_preferences_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: true
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_merge_households: {
        Args: { p_household_ids: string[] }
        Returns: boolean
      }
      create_household_from_draft: {
        Args: { p_draft_id: string }
        Returns: string
      }
      create_initial_tasks: {
        Args: { p_household_id: string }
        Returns: number
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_personalized_tasks: {
        Args: {
          p_user_id: string
          p_move_from_state: string
          p_move_to_state: string
          p_move_to_municipality: string
          p_has_children: boolean
          p_has_pets: boolean
          p_owns_car: boolean
          p_is_self_employed: boolean
          p_pet_types: string
          p_important_notes: string
        }
        Returns: {
          actual_duration: number | null
          assigned_to: string | null
          attachment_url: string | null
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
          link_url: string | null
          notes: string | null
          phase: Database["public"]["Enums"]["task_phase"]
          priority: Database["public"]["Enums"]["task_priority"]
          template_id: string | null
          title: string
          updated_at: string
        }[]
      }
      generate_unique_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_timeline: {
        Args: { p_household_id: string }
        Returns: {
          id: string
          title: string
          description: string
          phase: string
          priority: string
          category: string
          due_date: string
          completed: boolean
          assigned_to: string
          assignee_name: string
          is_overdue: boolean
          module_color: string
        }[]
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
      merge_households: {
        Args: {
          p_source_household_ids: string[]
          p_destination_household_id: string
        }
        Returns: string
      }
      search_items_in_boxes: {
        Args: { p_household_id: string; p_search_term: string }
        Returns: {
          box_id: string
          box_number: string
          box_name: string
          item_name: string
          item_description: string
          box_status: Database["public"]["Enums"]["box_status"]
          current_location: string
        }[]
      }
      update_task_due_date: {
        Args: { p_task_id: string; p_new_date: string }
        Returns: boolean
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
      box_category:
        | "küche"
        | "wohnzimmer"
        | "schlafzimmer"
        | "bad"
        | "keller"
        | "dachboden"
        | "büro"
        | "kinderzimmer"
        | "garten"
        | "sonstiges"
      box_status:
        | "leer"
        | "gepackt"
        | "versiegelt"
        | "transportiert"
        | "ausgepackt"
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
      box_category: [
        "küche",
        "wohnzimmer",
        "schlafzimmer",
        "bad",
        "keller",
        "dachboden",
        "büro",
        "kinderzimmer",
        "garten",
        "sonstiges",
      ],
      box_status: [
        "leer",
        "gepackt",
        "versiegelt",
        "transportiert",
        "ausgepackt",
      ],
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
