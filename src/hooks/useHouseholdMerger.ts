import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useHouseholds } from '@/hooks/useHouseholds'

export function useHouseholdMerger() {
  const { toast } = useToast()
  const { refetch } = useHouseholds()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mergeHouseholds = async (
    sourceHouseholdIds: string[],
    destinationHouseholdId: string
  ) => {
    if (!sourceHouseholdIds.length) {
      throw new Error('Keine Quell-Haushalte ausgewählt')
    }

    if (!destinationHouseholdId) {
      throw new Error('Kein Ziel-Haushalt ausgewählt')
    }

    if (sourceHouseholdIds.includes(destinationHouseholdId)) {
      throw new Error('Der Ziel-Haushalt kann nicht gleichzeitig ein Quell-Haushalt sein')
    }

    try {
      setLoading(true)
      setError(null)

      // Check if user can merge these households
      const { data: canMerge, error: checkError } = await supabase.rpc(
        'can_merge_households',
        { p_household_ids: [...sourceHouseholdIds, destinationHouseholdId] }
      )

      if (checkError) {
        throw checkError
      }

      if (!canMerge) {
        throw new Error('Du musst der Besitzer aller Haushalte sein, um sie zusammenzuführen')
      }

      // Perform the merge
      const { data, error: mergeError } = await supabase.rpc(
        'merge_households',
        {
          p_source_household_ids: sourceHouseholdIds,
          p_destination_household_id: destinationHouseholdId
        }
      )

      if (mergeError) {
        throw mergeError
      }

      // Refresh households list
      await refetch()

      toast({
        title: 'Haushalte zusammengeführt',
        description: `${sourceHouseholdIds.length} Haushalte wurden erfolgreich zusammengeführt.`
      })

      return data
    } catch (err) {
      console.error('Error merging households:', err)
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      setError(new Error(errorMessage))
      
      toast({
        title: 'Fehler beim Zusammenführen',
        description: errorMessage,
        variant: 'destructive'
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  const canMergeHouseholds = async (householdIds: string[]) => {
    try {
      const { data, error } = await supabase.rpc(
        'can_merge_households',
        { p_household_ids: householdIds }
      )

      if (error) {
        throw error
      }

      return data as boolean
    } catch (err) {
      console.error('Error checking merge capability:', err)
      return false
    }
  }

  return {
    mergeHouseholds,
    canMergeHouseholds,
    loading,
    error
  }
}