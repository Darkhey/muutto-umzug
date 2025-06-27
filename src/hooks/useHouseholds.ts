
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { APP_CONFIG } from '@/config/app'

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

    // Validate household size limits
    if (householdData.household_size && householdData.household_size > APP_CONFIG.defaults.maxMembersPerHousehold) {
      throw new Error(`Haushaltsgröße darf ${APP_CONFIG.defaults.maxMembersPerHousehold} Personen nicht überschreiten`)
    }

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
      // Validate member limits
      const { data: existingMembers } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', householdId)

      const currentMemberCount = existingMembers?.length || 0
      if (currentMemberCount + members.length > APP_CONFIG.defaults.maxMembersPerHousehold) {
        throw new Error(`Maximale Anzahl von ${APP_CONFIG.defaults.maxMembersPerHousehold} Mitgliedern erreicht`)
      }

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

  const updateHousehold = async (
    householdId: string,
    updates: Database['public']['Tables']['households']['Update']
  ) => {
    try {
      const { data, error } = await supabase
        .from('households')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', householdId)
        .select()
        .single()

      if (error) throw error

      await fetchHouseholds()
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Fehler beim Aktualisieren des Haushalts')
    }
  }

  const mergeHouseholds = async (
    sourceIds: string[],
    newHouseholdData: Omit<HouseholdInsert, 'created_by'>
  ) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')
    if (sourceIds.length < 2) throw new Error('Mindestens zwei Haushalte erforderlich')

    try {
      const allMembers: Array<{ name: string; email: string; role?: string }> = []

      for (const id of sourceIds) {
        const { data: members, error } = await supabase
          .from('household_members')
          .select('name, email, role')
          .eq('household_id', id)

        if (error) throw error

        members?.forEach(m => {
          const normalizedEmail = m.email?.trim().toLowerCase() || null
          if (
            !allMembers.find(
              am =>
                (am.email?.toLowerCase() ?? null) === normalizedEmail &&
                am.name === m.name
            )
          ) {
            allMembers.push({
              name: m.name,
              email: normalizedEmail,
              role: m.role ?? undefined
            })
          }
        })
      }

      const newHousehold = await createHousehold(newHouseholdData)

      const membersToAdd = allMembers.filter(
        m => m.email && m.email !== user.email?.toLowerCase()
      )
      if (membersToAdd.length > 0) {
        await addMembers(newHousehold.id, membersToAdd)
      }

      await fetchHouseholds()
      return newHousehold
    } catch (err) {
      throw err instanceof Error ? err : new Error('Fehler beim Zusammenführen der Haushalte')
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
    updateHousehold,
    mergeHouseholds,
    refetch: fetchHouseholds
  }
}
