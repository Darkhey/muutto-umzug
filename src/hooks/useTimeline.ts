
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
    if (!householdId || !user) {
      console.log('useTimeline: Missing householdId or user', { householdId, user: !!user })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('useTimeline: Fetching timeline data for household:', householdId)

      // Versuche zuerst direkt die Tasks zu laden (ohne Edge Function)
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_member:household_members!tasks_assigned_to_fkey(name)
        `)
        .eq('household_id', householdId)
        .order('due_date', { ascending: true, nullsLast: true })

      if (tasksError) {
        console.error('useTimeline: Error fetching tasks:', tasksError)
        throw new Error(`Fehler beim Laden der Aufgaben: ${tasksError.message}`)
      }

      console.log('useTimeline: Tasks loaded:', tasks)

      // Transformiere die Daten
      const formattedItems: TimelineItem[] = (tasks || []).map((task) => ({
        id: task.id,
        title: task.title || 'Unbenannte Aufgabe',
        description: task.description || '',
        start: task.due_date,
        phase: task.phase || 'vor_umzug',
        priority: task.priority || 'mittel',
        category: task.category || '',
        completed: task.completed || false,
        assigned_to: task.assigned_to,
        assignee_name: task.assigned_member?.name || null,
        is_overdue: task.due_date ? new Date(task.due_date) < new Date() && !task.completed : false,
        module_color: getModuleColor(task.phase || 'vor_umzug'),
        className: `timeline-item-${task.priority || 'mittel'} ${task.completed ? 'completed' : ''} ${task.due_date && new Date(task.due_date) < new Date() && !task.completed ? 'overdue' : ''}`
      }))

      console.log('useTimeline: Formatted items:', formattedItems)
      setTimelineItems(formattedItems)

      // Lade Preferences
      const { data: prefsData } = await supabase
        .from('timeline_preferences')
        .select('*')
        .eq('household_id', householdId)
        .maybeSingle()

      if (prefsData) {
        setPreferences({
          zoom_level: prefsData.zoom_level || 'month',
          snap_to_grid: prefsData.snap_to_grid ?? true,
          show_modules: prefsData.show_modules || ['all'],
        })
      }

    } catch (err) {
      console.error('useTimeline: Error in fetchTimelineData:', err)
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      setError(new Error(errorMessage))
      toast({
        title: 'Fehler beim Laden der Zeitachse',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [householdId, user, toast])

  // Helper function to get module color
  const getModuleColor = (phase: string): string => {
    switch (phase) {
      case 'vor_umzug': return 'blue'
      case 'umzugstag': return 'green'
      case 'nach_umzug': return 'purple'
      case 'langzeit': return 'orange'
      default: return 'gray'
    }
  }

  // Update task due date
  const updateTaskDueDate = async (taskId: string, newDate: Date | null) => {
    try {
      const formattedDate = newDate ? newDate.toISOString().split('T')[0] : null

      const { error } = await supabase
        .from('tasks')
        .update({ due_date: formattedDate })
        .eq('id', taskId)

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
        .upsert({
          household_id: householdId,
          ...preferences,
          ...newPrefs,
        })

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
          console.log('useTimeline: Real-time update received, refetching...')
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
