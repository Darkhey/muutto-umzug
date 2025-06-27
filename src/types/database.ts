
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
    }
  }
}

export type HouseholdRole = 'vertragsmanager' | 'packbeauftragte' | 'finanzperson' | 'renovierer' | 'haustierverantwortliche'
export type PropertyType = 'miete' | 'eigentum'
