
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'
import { useToast } from '@/hooks/use-toast'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export function useTasks(householdId?: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    if (!householdId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('household_id', householdId)
        .order('due_date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Fehler beim Laden der Aufgaben",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<TaskInsert, 'household_id'>) => {
    if (!householdId || !user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          household_id: householdId
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Aufgabe erstellt",
        description: "Die Aufgabe wurde erfolgreich erstellt."
      })

      await fetchTasks()
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Aufgabe aktualisiert",
        description: "Die Aufgabe wurde erfolgreich aktualisiert."
      })

      await fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const updates: TaskUpdate = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        completed_by: completed ? user?.id : null
      }

      await updateTask(taskId, updates)
    } catch (error) {
      console.error('Error toggling task completion:', error)
      throw error
    }
  }

  const createInitialTasks = async () => {
    if (!householdId) return

    try {
      const { data, error } = await supabase.rpc('create_initial_tasks', {
        p_household_id: householdId
      })

      if (error) throw error

      toast({
        title: "Aufgaben erstellt",
        description: `${data} Aufgaben wurden aus Vorlagen erstellt.`
      })

      await fetchTasks()
      return data
    } catch (error) {
      console.error('Error creating initial tasks:', error)
      throw error
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Aufgabe gelöscht",
        description: "Die Aufgabe wurde erfolgreich gelöscht."
      })

      await fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [householdId])

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    toggleTaskCompletion,
    createInitialTasks,
    deleteTask,
    refetch: fetchTasks
  }
}
