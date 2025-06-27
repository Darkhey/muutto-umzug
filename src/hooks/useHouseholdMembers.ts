
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { HouseholdMember, HouseholdRole } from '@/types/household'
import { useToast } from '@/hooks/use-toast'

export function useHouseholdMembers(householdId?: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMembers = async () => {
    if (!householdId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({
        title: "Fehler beim Laden der Mitglieder",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async (email: string, name: string, role?: HouseholdRole) => {
    if (!householdId || !user) return

    try {
      const { data, error } = await supabase
        .from('household_members')
        .insert({
          household_id: householdId,
          name,
          email,
          role,
          is_owner: false,
          invited_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Einladung versendet",
        description: `${name} wurde erfolgreich eingeladen.`
      })

      await fetchMembers()
      return data
    } catch (error) {
      console.error('Error inviting member:', error)
      throw error
    }
  }

  const updateMemberRole = async (memberId: string, role: HouseholdRole | null) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('id', memberId)

      if (error) throw error

      toast({
        title: "Rolle aktualisiert",
        description: "Die Mitglieder-Rolle wurde erfolgreich geändert."
      })

      await fetchMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
      throw error
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast({
        title: "Mitglied entfernt",
        description: "Das Mitglied wurde erfolgreich entfernt."
      })

      await fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      throw error
    }
  }

  const acceptInvitation = async (memberId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .update({
          user_id: userId,
          joined_at: new Date().toISOString()
        })
        .eq('id', memberId)

      if (error) throw error

      await fetchMembers()
    } catch (error) {
      console.error('Error accepting invitation:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [householdId])

  return {
    members,
    loading,
    inviteMember,
    updateMemberRole,
    removeMember,
    acceptInvitation,
    refetch: fetchMembers
  }
}
