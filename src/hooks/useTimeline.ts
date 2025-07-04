
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { TimelineItem } from '@/types/timeline'

interface TimelinePreferences {
  zoom_level: 'week' | 'month'
  snap_to_grid: boolean
  show_modules: string[]
}

export const useTimeline = (householdId: string) => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [preferences, setPreferences] = useState<TimelinePreferences>({
    zoom_level: 'month',
    snap_to_grid: true,
    show_modules: ['all']
  })
  const [loading, setLoading] = useState(true)

  const updateTaskDueDate = async (taskId: string, newDate: Date | null) => {
    try {
      const { error } = await supabase.rpc('update_task_due_date', {
        p_task_id: taskId,
        p_new_date: newDate ? newDate.toISOString().split('T')[0] : null
      })
      if (error) throw error
    } catch (error) {
      console.error('Error updating task due date:', error)
    }
  }

  const updatePreferences = async (updates: Partial<TimelinePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  return {
    timelineItems,
    preferences,
    loading,
    updateTaskDueDate,
    updatePreferences
  }
}
