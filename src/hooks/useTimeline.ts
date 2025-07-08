
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

  const updateTask = async (taskId: string, updates: Partial<TimelineItem>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select();

      if (error) throw error;

      if (data) {
        setTimelineItems(prev =>
          prev.map(item => (item.id === taskId ? { ...item, ...data[0] } : item))
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const addTask = async (task: Omit<TimelineItem, 'id' | 'created_at' | 'completed' | 'is_overdue'>) => {
    try {
      // Validate required fields
      if (!task.title?.trim()) {
        throw new Error('Titel ist erforderlich');
      }
      if (!task.phase) {
        throw new Error('Phase ist erforderlich');
      }
      if (!task.priority) {
        throw new Error('Priorität ist erforderlich');
      }

      const taskData = {
        ...task,
        household_id: householdId,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) throw error;

      if (data) {
        setTimelineItems(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const fetchTimelineItems = async () => {
    if (!householdId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_comments(count)')
        .eq('household_id', householdId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const itemsWithCommentCount = data.map(item => ({
        ...item,
        comment_count: item.task_comments?.[0]?.count || 0,
      }));

      setTimelineItems(itemsWithCommentCount);
    } catch (error) {
      console.error('Error fetching timeline items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineItems();
  }, [householdId]);

  const updatePreferences = async (updates: Partial<TimelinePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return {
    timelineItems,
    preferences,
    loading,
    updateTaskDueDate,
    updateTask,
    addTask,
    updatePreferences,
    refetchTimelineItems: fetchTimelineItems,
  };
}
