import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ExtendedMove, MoveInsert } from '@/types/move'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

export function useMoves() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { status: premiumStatus } = usePremiumStatus()
  const [moves, setMoves] = useState<ExtendedMove[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMoves = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('moves')
        .select('*, move_households(household_id), move_members_roles(*)')
        .eq('created_by', user.id) // Only fetch moves created by the current user
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedMoves: ExtendedMove[] = data.map(move => ({
        ...move,
        households: move.move_households.map(mh => mh.household_id),
        members_roles: move.move_members_roles,
      }))

      setMoves(formattedMoves || [])
    } catch (err) {
      console.error('Error fetching moves:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast({
        title: "Fehler beim Laden der Umzüge",
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createMove = async (moveData: { name: string; move_date: string; initialHouseholdIds: string[] }) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')
    if (!premiumStatus?.is_premium && moveData.initialHouseholdIds.length > 1) {
      toast({
        title: "Premium erforderlich",
        description: "Nur Premium-Nutzer können Umzüge mit mehreren Haushalten erstellen.",
        variant: "destructive"
      })
      throw new Error("Premium erforderlich")
    }

    try {
      const { name, move_date, initialHouseholdIds } = moveData

      const { data: move, error: moveError } = await supabase
        .from('moves')
        .insert({
          name,
          move_date,
          created_by: user.id,
        })
        .select()
        .single()

      if (moveError) throw moveError

      // Link initial households to the new move
      if (initialHouseholdIds && initialHouseholdIds.length > 0) {
        const householdLinks = initialHouseholdIds.map(householdId => ({
          move_id: move.id,
          household_id: householdId,
        }))
        const { error: linkError } = await supabase
          .from('move_households')
          .insert(householdLinks)
        if (linkError) throw linkError
      }

      toast({
        title: "Umzug erfolgreich erstellt! 🎉",
        description: `${move.name} wurde erstellt und ist bereit für die Koordination.`
      })

      await fetchMoves()
      return move
    } catch (err) {
      console.error('Error creating move:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Erstellen des Umzugs')
    }
  }

  const addMoveMemberRole = async (moveId: string, userId: string, role: string) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')
    try {
      const { error } = await supabase
        .from('move_members_roles')
        .insert({
          move_id: moveId,
          user_id: userId,
          role,
        })
      if (error) throw error
      toast({
        title: "Rolle zugewiesen",
        description: "Rolle erfolgreich für den Umzug zugewiesen."
      })
      await fetchMoves()
    } catch (err) {
      console.error('Error assigning move role:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Zuweisen der Umzugsrolle')
    }
  }

  const removeMoveMemberRole = async (roleId: string) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')
    try {
      const { error } = await supabase
        .from('move_members_roles')
        .delete()
        .eq('id', roleId)
      if (error) throw error
      toast({
        title: "Rolle entfernt",
        description: "Rolle erfolgreich vom Umzug entfernt."
      })
      await fetchMoves()
    } catch (err) {
      console.error('Error removing move role:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Entfernen der Umzugsrolle')
    }
  }

  const linkHouseholdToMove = async (moveId: string, householdId: string) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')
    if (!premiumStatus?.is_premium) {
      toast({
        title: "Premium erforderlich",
        description: "Nur Premium-Nutzer können Haushalte mit einem Umzug verknüpfen.",
        variant: "destructive"
      })
      throw new Error("Premium erforderlich")
    }
    try {
      const { error } = await supabase
        .from('move_households')
        .insert({
          move_id: moveId,
          household_id: householdId,
        })
      if (error) throw error
      toast({
        title: "Haushalt verknüpft",
        description: "Haushalt erfolgreich mit dem Umzug verknüpft."
      })
      await fetchMoves()
    } catch (err) {
      console.error('Error linking household to move:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Verknüpfen des Haushalts mit dem Umzug')
    }
  }

  const unlinkHouseholdFromMove = async (moveId: string, householdId: string) => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet')
    try {
      const { error } = await supabase
        .from('move_households')
        .delete()
        .eq('move_id', moveId)
        .eq('household_id', householdId)
      if (error) throw error
      toast({
        title: "Haushalt entknüpft",
        description: "Haushalt erfolgreich vom Umzug entknüpft."
      })
      await fetchMoves()
    } catch (err) {
      console.error('Error unlinking household from move:', err)
      throw err instanceof Error ? err : new Error('Fehler beim Entknüpfen des Haushalts vom Umzug')
    }
  }

  useEffect(() => {
    fetchMoves()
  }, [user])

  return {
    moves,
    loading,
    error,
    fetchMoves,
    createMove,
    addMoveMemberRole,
    removeMoveMemberRole,
    linkHouseholdToMove,
    unlinkHouseholdFromMove,
  }
}
