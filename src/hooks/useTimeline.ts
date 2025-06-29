import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { TimelineItem, TimelinePreferences } from '@/types/timeline'

export function useTimeline(householdId?: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [preferences, setPreferences] = useState<TimelinePreferences>({
    zoom_level: 'month',
    snap_to_grid: true,
    show_modules: ['all']
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch timeline data
  const fetchTimelineData = useCallback(async () => {
    if (!householdId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch timeline items
      const { data, error: itemsError } = await supabase.rpc(
        'get_timeline',
        { p_household_id: householdId }
      )

      if (itemsError) throw itemsError

      // Format data for timeline
      const formattedItems: TimelineItem[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        start: item.due_date,
        phase: item.phase,
        priority: item.priority,
        category: item.category || '',
        completed: item.completed,
        assigned_to: item.assigned_to,
        assignee_name: item.assignee_name,
        is_overdue: item.is_overdue,
        module_color: item.module_color,
        className: `timeline-item-${item.priority} ${item.completed ? 'completed' : ''} ${item.is_overdue ? 'overdue' : ''}`
      }))

      setTimelineItems(formattedItems)

      // Fetch preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('timeline_preferences')
        .select('*')
        .eq('household_id', householdId)
        .maybeSingle()

      if (prefsError) throw prefsError

      if (prefsData) {
        setPreferences({
          zoom_level: prefsData.zoom_level,
          snap_to_grid: prefsData.snap_to_grid,
          show_modules: prefsData.show_modules
        })
      } else {
        // Create default preferences if none exist
        await supabase
          .from('timeline_preferences')
          .insert({
            household_id: householdId,
            zoom_level: 'month',
            snap_to_grid: true,
            show_modules: ['all']
          })
      }
    } catch (err) {
      console.error('Error fetching timeline data:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch timeline data'))
      toast({
        title: 'Fehler beim Laden der Zeitachse',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [householdId, toast])

  // Update task due date
  const updateTaskDueDate = async (taskId: string, newDate: Date | null) => {
    try {
      const formattedDate = newDate ? newDate.toISOString().split('T')[0] : null

      const { error } = await supabase.rpc(
        'update_task_due_date',
        {
          p_task_id: taskId,
          p_new_date: formattedDate
        }
      )

      if (error) throw error

      // Optimistic update
      setTimelineItems(prev => 
        prev.map(item => 
          item.id === taskId 
            ? { ...item, start: formattedDate, is_overdue: newDate ? newDate < new Date() && !item.completed : false }
            : item
        )
      )

      toast({
        title: 'Aufgabe aktualisiert',
        description: 'Das Fälligkeitsdatum wurde erfolgreich geändert.'
      })

      return true
    } catch (err) {
      console.error('Error updating task due date:', err)
      toast({
        title: 'Fehler beim Aktualisieren',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      })
      return false
    }
  }

  // Update timeline preferences
  const updatePreferences = async (newPrefs: Partial<TimelinePreferences>) => {
    if (!householdId) return false

    try {
      const { error } = await supabase
        .from('timeline_preferences')
        .update({
          ...newPrefs,
          updated_at: new Date().toISOString()
        })
        .eq('household_id', householdId)

      if (error) throw error

      setPreferences(prev => ({ ...prev, ...newPrefs }))
      return true
    } catch (err) {
      console.error('Error updating timeline preferences:', err)
      toast({
        title: 'Fehler beim Speichern der Einstellungen',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      })
      return false
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!householdId) return

    const channel = supabase
      .channel(`tasks-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `household_id=eq.${householdId}`
        },
        () => {
          fetchTimelineData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, fetchTimelineData])

  // Initial data fetch
  useEffect(() => {
    fetchTimelineData()
  }, [fetchTimelineData])

  return {
    timelineItems,
    preferences,
    loading,
    error,
    updateTaskDueDate,
    updatePreferences,
    refetch: fetchTimelineData
  }
}