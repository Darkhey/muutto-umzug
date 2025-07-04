import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { APP_CONFIG } from '@/config/app'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'

type Household = ExtendedHousehold
type HouseholdInsert = Database['public']['Tables']['households']['Insert']

export interface CreateHouseholdFormData {
  name: string
  move_date: string
  household_size: number
  children_count: number
  pets_count: number
  property_type: 'miete' | 'eigentum'
  postal_code?: string | null
  old_address?: string | null
  new_address?: string | null
  living_space?: number | null
  rooms?: number | null
  furniture_volume?: number | null
  owns_car?: boolean | null
  is_self_employed?: boolean | null
  ad_url?: string | null
}

export interface HouseholdMember {
  name: string
  email: string
  role?: string
}

export function useHouseholds() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHouseholds = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('households')
        .select('*, created_by_user_profile:profiles(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHouseholds(data || [])
    } catch (err) {
      console.error('Error fetching households:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast({
        title: "Fehler beim Laden der Haushalte",
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const validateHouseholdData = (data: CreateHouseholdFormData): string[] => {
    const errors: string[] = []

    // Required fields
    if (!data.name?.trim()) {
      errors.push('Haushaltsname ist erforderlich')
    }
    if (!data.move_date) {
      errors.push('Umzugsdatum ist erforderlich')
    }
    if (!data.property_type) {
      errors.push('Wohnform ist erforderlich')
    }

    // Validate move date is in the future
    if (data.move_date) {
      const moveDate = new Date(data.move_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (moveDate < today) {
        errors.push('Umzugsdatum muss in der Zukunft liegen')
      }
    }

    // Validate household size
    if (data.household_size < 1) {
      errors.push('Haushaltsgröße muss mindestens 1 sein')
    }
    if (data.household_size > APP_CONFIG.defaults.maxMembersPerHousehold) {
      errors.push(`Haushaltsgröße darf ${APP_CONFIG.defaults.maxMembersPerHousehold} nicht überschreiten`)
    }

    // Validate counts
    if (data.children_count < 0) {
      errors.push('Anzahl Kinder kann nicht negativ sein')
    }
    if (data.pets_count < 0) {
      errors.push('Anzahl Haustiere kann nicht negativ sein')
    }

    // Validate postal code format (German)
    if (data.postal_code && !/^\d{5}$/.test(data.postal_code)) {
      errors.push('Postleitzahl muss 5 Ziffern haben')
    }

    // Validate numeric fields
    if (data.living_space !== null && data.living_space !== undefined && data.living_space < 0) {
      errors.push('Wohnfläche kann nicht negativ sein')
    }
    if (data.rooms !== null && data.rooms !== undefined && data.rooms < 0) {
      errors.push('Anzahl Zimmer kann nicht negativ sein')
    }
    if (data.furniture_volume !== null && data.furniture_volume !== undefined && data.furniture_volume < 0) {
      errors.push('Möbelvolumen kann nicht negativ sein')
    }

    // Validate boolean fields
    if (data.owns_car !== null && typeof data.owns_car !== 'boolean') {
      errors.push('Auto-Besitz muss ein gültiger Wert sein')
    }
    if (data.is_self_employed !== null && typeof data.is_self_employed !== 'boolean') {
      errors.push('Selbstständigkeits-Status muss ein gültiger Wert sein')
    }

    return errors
  }

  const createHousehold = async (householdData: CreateHouseholdFormData) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')

    // Validate input data
    const validationErrors = validateHouseholdData(householdData)
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '))
    }

    try {
      console.log("Creating household with data:", householdData);
      
      // Create household with auto-generated invitation code
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: householdData.name,
          move_date: householdData.move_date,
          household_size: householdData.household_size,
          children_count: householdData.children_count,
          pets_count: householdData.pets_count,
          property_type: householdData.property_type,
          postal_code: householdData.postal_code || null,
          old_address: householdData.old_address || null,
          new_address: householdData.new_address || null,
          living_space: householdData.living_space || null,
          rooms: householdData.rooms || null,
          furniture_volume: householdData.furniture_volume || null,
          owns_car: householdData.owns_car ?? null,
          is_self_employed: householdData.is_self_employed ?? null,
          ad_url: householdData.ad_url || null,
          created_by: user.id,
          invitation_code: '' // Will be auto-generated by trigger
        })
        .select()
        .single()

      if (householdError) {
        console.error("Household creation error:", householdError);
        throw householdError;
      }

      console.log("Household created successfully:", household);

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email || 'Unbenannt',
          email: user.email || '',
          is_owner: true,
          joined_at: new Date().toISOString()
        })

      if (memberError) {
        console.error('Error creating owner member:', memberError)
        // Try to clean up the household if member creation fails
        await supabase.from('households').delete().eq('id', household.id)
        throw memberError
      }

      // Create initial tasks from templates
      try {
        const { data: taskCount, error: taskError } = await supabase.rpc('create_initial_tasks', {
          p_household_id: household.id
        })

        if (taskError) {
          console.warn('Error creating initial tasks:', taskError)
          // Don't throw here, household creation should still succeed
        } else {
          console.log(`Created ${taskCount} initial tasks`)
        }
      } catch (taskErr) {
        console.warn('Error creating initial tasks:', taskErr)
        // Don't throw here, household creation should still succeed
      }

      toast({
        title: "Haushalt erfolgreich erstellt! 🎉",
        description: `${household.name} wurde erstellt und ist bereit für die Planung.`
      })

      await fetchHouseholds()
      return household
    } catch (err) {
      console.error('Error creating household:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Erstellen des Haushalts')
    }
  }

  const addMembers = async (householdId: string, members: HouseholdMember[]) => {
    if (!members || members.length === 0) return

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

      // Validate member data
      const validMembers = members.filter(member => {
        if (!member.name?.trim()) return false
        if (!member.email?.trim()) return false
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) return false
        return true
      })

      if (validMembers.length === 0) {
        throw new Error('Keine gültigen Mitglieder zum Hinzufügen')
      }

      // Check for duplicate emails
      const emails = validMembers.map(m => m.email.toLowerCase())
      const uniqueEmails = [...new Set(emails)]
      if (emails.length !== uniqueEmails.length) {
        throw new Error('Doppelte E-Mail-Adressen sind nicht erlaubt')
      }

      // Check if any email already exists in this household
      const { data: existingEmailMembers } = await supabase
        .from('household_members')
        .select('email')
        .eq('household_id', householdId)
        .in('email', uniqueEmails)

      if (existingEmailMembers && existingEmailMembers.length > 0) {
        const duplicateEmails = existingEmailMembers.map(m => m.email).join(', ')
        throw new Error(`Diese E-Mail-Adressen sind bereits Mitglieder: ${duplicateEmails}`)
      }

      const memberInserts = validMembers.map(member => ({
        household_id: householdId,
        name: member.name.trim(),
        email: member.email.trim().toLowerCase(),
        role: member.role || null,
        is_owner: false,
        invited_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('household_members')
        .insert(memberInserts)

      if (error) throw error

      toast({
        title: "Mitglieder erfolgreich eingeladen! 📧",
        description: `${validMembers.length} Mitglied(er) wurden eingeladen und erhalten eine E-Mail.`
      })
    } catch (err) {
      console.error('Error adding members:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Hinzufügen der Mitglieder')
    }
  }

  const updateHousehold = async (
    householdId: string,
    updates: Partial<CreateHouseholdFormData>
  ) => {
    try {
      // Validate updates if provided
      if (Object.keys(updates).length > 0) {
        const currentHousehold = households.find(h => h.id === householdId)
        if (!currentHousehold) {
          throw new Error('Haushalt nicht gefunden')
        }

        const updatedData = { ...currentHousehold, ...updates }
        const validationErrors = validateHouseholdData(updatedData as CreateHouseholdFormData)
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(', '))
        }
      }

      const { data, error } = await supabase
        .from('households')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', householdId)
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Haushalt aktualisiert ✅",
        description: "Die Änderungen wurden erfolgreich gespeichert."
      })

      await fetchHouseholds()
      return data
    } catch (err) {
      console.error('Error updating household:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Aktualisieren des Haushalts')
    }
  }

  const deleteHousehold = async (householdId: string) => {
    try {
      const { error } = await supabase
        .from('households')
        .delete()
        .eq('id', householdId)

      if (error) throw error

      toast({
        title: "Haushalt gelöscht",
        description: "Der Haushalt wurde erfolgreich entfernt."
      })

      await fetchHouseholds()
    } catch (err) {
      console.error('Error deleting household:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Löschen des Haushalts')
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
    deleteHousehold,
    refetch: fetchHouseholds
  }
}
