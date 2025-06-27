
export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          move_date: string
          household_size: number
          children_count: number
          pets_count: number
          property_type: 'miete' | 'eigentum'
          postal_code: string | null
          invitation_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          move_date: string
          household_size?: number
          children_count?: number
          pets_count?: number
          property_type: 'miete' | 'eigentum'
          postal_code?: string | null
          invitation_code?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          move_date?: string
          household_size?: number
          children_count?: number
          pets_count?: number
          property_type?: 'miete' | 'eigentum'
          postal_code?: string | null
          invitation_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string | null
          name: string
          email: string | null
          role: 'vertragsmanager' | 'packbeauftragte' | 'finanzperson' | 'renovierer' | 'haustierverantwortliche' | null
          is_owner: boolean
          invited_at: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id?: string | null
          name: string
          email?: string | null
          role?: 'vertragsmanager' | 'packbeauftragte' | 'finanzperson' | 'renovierer' | 'haustierverantwortliche' | null
          is_owner?: boolean
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string | null
          name?: string
          email?: string | null
          role?: 'vertragsmanager' | 'packbeauftragte' | 'finanzperson' | 'renovierer' | 'haustierverantwortliche' | null
          is_owner?: boolean
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          household_id: string
          title: string
          description: string | null
          phase: TaskPhase
          assigned_to: string | null
          due_date: string | null
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          priority: TaskPriority
          category: string | null
          template_id: string | null
          dependencies: string[] | null
          estimated_duration: number | null
          actual_duration: number | null
          notes: string | null
          attachments: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          title: string
          description?: string | null
          phase: TaskPhase
          assigned_to?: string | null
          due_date?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          priority?: TaskPriority
          category?: string | null
          template_id?: string | null
          dependencies?: string[] | null
          estimated_duration?: number | null
          actual_duration?: number | null
          notes?: string | null
          attachments?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          title?: string
          description?: string | null
          phase?: TaskPhase
          assigned_to?: string | null
          due_date?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          priority?: TaskPriority
          category?: string | null
          template_id?: string | null
          dependencies?: string[] | null
          estimated_duration?: number | null
          actual_duration?: number | null
          notes?: string | null
          attachments?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      checklist_templates: {
        Row: {
          id: string
          title: string
          description: string | null
          phase: TaskPhase
          assigned_role: HouseholdRole | null
          days_before_move: number | null
          priority: TaskPriority
          category: string | null
          conditions: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          phase: TaskPhase
          assigned_role?: HouseholdRole | null
          days_before_move?: number | null
          priority?: TaskPriority
          category?: string | null
          conditions?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          phase?: TaskPhase
          assigned_role?: HouseholdRole | null
          days_before_move?: number | null
          priority?: TaskPriority
          category?: string | null
          conditions?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type HouseholdRole = 'vertragsmanager' | 'packbeauftragte' | 'finanzperson' | 'renovierer' | 'haustierverantwortliche'
export type PropertyType = 'miete' | 'eigentum'
export type TaskPhase = 'vor_umzug' | 'umzugstag' | 'nach_umzug' | 'langzeit'
export type TaskPriority = 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
