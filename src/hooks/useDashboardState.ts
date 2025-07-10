import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { useTasks } from '@/hooks/useTasks'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'
import { CreateHouseholdFormData } from '@/hooks/useHouseholds'

type ViewMode = 'dashboard' | 'onboarding' | 'onboarding-success' | 'task-list' | 'timeline' | 'member-management'

export const useDashboardState = () => {
  const { user } = useAuth()
  const { households, loading, createHousehold, addMembers } = useHouseholds()
  const { toast } = useToast()
  
  const [activeHousehold, setActiveHousehold] = useState<ExtendedHousehold | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [onboardingData, setOnboardingData] = useState<{ householdName: string; moveDate: string } | null>(null)

  // Tasks for active household
  const { tasks, loading: tasksLoading, toggleTaskCompletion, createTask } = useTasks(activeHousehold?.id)

  // Set active household when households change
  useEffect(() => {
    if (households && households.length > 0 && !activeHousehold) {
      setActiveHousehold(households[0])
    }
  }, [households, activeHousehold])

  // Redirect to onboarding if no households
  useEffect(() => {
    if (!loading && households.length === 0 && viewMode === 'dashboard') {
      setViewMode('onboarding')
    }
  }, [loading, households.length, viewMode])

  const handleOnboardingComplete = async (data: CreateHouseholdFormData) => {
    try {
      setOnboardingData({ householdName: data.name, moveDate: data.move_date })
      const household = await createHousehold(data)
      
      if (data.members && data.members.length > 0) {
        const validMembers = data.members.filter((m: { name: string; email: string }) => m.name.trim() && m.email.trim())
        if (validMembers.length > 0) {
          await addMembers(household.id, validMembers)
        }
      }
      
      setActiveHousehold(household)
      setViewMode('onboarding-success')
    } catch (error) {
      toast({
        title: 'Fehler beim Erstellen',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      })
    }
  }

  const handleOnboardingSuccessComplete = () => {
    setViewMode('dashboard')
    toast({
      title: 'Willkommen bei muutto! 🎉',
      description: `Dein Haushalt "${onboardingData?.householdName}" ist bereit!`
    })
  }

  const handleCreateTask = async (taskData: any) => {
    if (!activeHousehold) return
    
    try {
      await createTask(taskData)
      setShowCreateTask(false)
      toast({
        title: 'Aufgabe erstellt',
        description: 'Die Aufgabe wurde erfolgreich hinzugefügt.'
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Aufgabe konnte nicht erstellt werden.',
        variant: 'destructive'
      })
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTaskCompletion(taskId, completed)
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Aufgabe konnte nicht aktualisiert werden.',
        variant: 'destructive'
      })
    }
  }

  // Calculate stats
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  // Get upcoming tasks for sidebar
  const upcomingTasks = tasks
    .filter(task => !task.completed && task.due_date)
    .map(task => ({
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      priority: task.priority
    }))

  return {
    user,
    households,
    loading,
    activeHousehold,
    viewMode,
    setViewMode,
    showCreateTask,
    setShowCreateTask,
    onboardingData,
    tasks,
    tasksLoading,
    completedTasks,
    totalTasks,
    upcomingTasks,
    handleOnboardingComplete,
    handleOnboardingSuccessComplete,
    handleCreateTask,
    handleToggleTask
  }
}