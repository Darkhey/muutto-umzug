
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

      if (error) {
        console.error('Error fetching members:', error)
        throw error
      }
      
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
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', householdId)
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (existingMember) {
        throw new Error('Diese E-Mail-Adresse ist bereits Mitglied dieses Haushalts')
      }

      const { data, error } = await supabase
        .from('household_members')
        .insert({
          household_id: householdId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role || null,
          is_owner: false,
          invited_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error inviting member:', error)
        throw error
      }

      toast({
        title: "Einladung versendet",
        description: `${name} wurde erfolgreich eingeladen.`
      })

      await fetchMembers()
      return data
    } catch (error) {
      console.error('Error inviting member:', error)
      toast({
        title: "Fehler beim Einladen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
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
      toast({
        title: "Fehler beim Aktualisieren der Rolle",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
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
      toast({
        title: "Fehler beim Entfernen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
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

      toast({
        title: "Einladung angenommen",
        description: "Sie sind jetzt Mitglied dieses Haushalts."
      })

      await fetchMembers()
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast({
        title: "Fehler beim Annehmen der Einladung",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
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
