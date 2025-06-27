
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

type Household = Database['public']['Tables']['households']['Row']
type HouseholdInsert = Database['public']['Tables']['households']['Insert']
type HouseholdMember = Database['public']['Tables']['household_members']['Row']

export function useHouseholds() {
  const { user } = useAuth()
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHouseholds = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHouseholds(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const createHousehold = async (householdData: Omit<HouseholdInsert, 'created_by'>) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')

    try {
      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          ...householdData,
          created_by: user.id
        })
        .select()
        .single()

      if (householdError) throw householdError

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email || 'Unbenannt',
          email: user.email,
          is_owner: true,
          joined_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      await fetchHouseholds()
      return household
    } catch (err) {
      throw err instanceof Error ? err : new Error('Fehler beim Erstellen des Haushalts')
    }
  }

  const addMembers = async (householdId: string, members: Array<{
    name: string
    email: string
    role?: string
  }>) => {
    try {
      const memberInserts = members.map(member => ({
        household_id: householdId,
        name: member.name,
        email: member.email,
        role: member.role || null,
        is_owner: false
      }))

      const { error } = await supabase
        .from('household_members')
        .insert(memberInserts)

      if (error) throw error
    } catch (err) {
      throw err instanceof Error ? err : new Error('Fehler beim Hinzufügen der Mitglieder')
    }
  }

  useEffect(() => {
    fetchHouseholds()
  }, [user])

  return {
    households,
    loading,
    error,
    createHousehold,
    addMembers,
    refetch: fetchHouseholds
  }
}
