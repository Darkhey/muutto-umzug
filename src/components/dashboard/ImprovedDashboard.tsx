import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { useTasks } from '@/hooks/useTasks'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'
import { Database } from '@/types/database'

// New Dashboard Components
import { DashboardHero } from './DashboardHero'
import { UrgentTasksWidget } from './UrgentTasksWidget'
import { AddressOverview } from './AddressOverview'
import { QuickActions } from './QuickActions'
import { InsightsSidebar } from './InsightsSidebar'

// Existing Components
import { OnboardingFlowWithDrafts } from '@/components/onboarding/OnboardingFlowWithDrafts'
import { OnboardingSuccess } from '@/components/onboarding/OnboardingSuccess'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { TaskList } from '@/components/TaskList'
import { TimelineView } from '@/components/timeline/TimelineView'
import { MemberManagement } from '@/components/household/MemberManagement'
import { FloatingChatButton } from '@/components/ai/FloatingChatButton'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Plus, LogOut } from 'lucide-react'
import { APP_CONFIG } from '@/config/app'
import { CreateHouseholdFormData } from '@/hooks/useHouseholds'

type Task = Database['public']['Tables']['tasks']['Row']

type ViewMode = 'dashboard' | 'onboarding' | 'onboarding-success' | 'task-list' | 'timeline' | 'member-management'

export const ImprovedDashboard = () => {
  const { user, signOut } = useAuth()
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt Dashboard...</p>
        </div>
      </div>
    )
  }

  // Render different views
  if (viewMode === 'onboarding') {
    return (
      <OnboardingFlowWithDrafts 
        onComplete={handleOnboardingComplete}
        onSkip={() => setViewMode('dashboard')}
      />
    )
  }

  if (viewMode === 'onboarding-success' && onboardingData) {
    return (
      <OnboardingSuccess
        householdName={onboardingData.householdName}
        moveDate={onboardingData.moveDate}
        onContinue={handleOnboardingSuccessComplete}
      />
    )
  }

  if (viewMode === 'task-list' && activeHousehold) {
    return (
      <TaskList 
        household={activeHousehold} 
        onBack={() => setViewMode('dashboard')} 
      />
    )
  }

  if (viewMode === 'timeline' && activeHousehold) {
    return (
      <TimelineView 
        household={activeHousehold} 
        onBack={() => setViewMode('dashboard')} 
      />
    )
  }

  if (viewMode === 'member-management' && activeHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setViewMode('dashboard')} className="mr-4">
              ← Zurück zum Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mitglieder verwalten</h1>
          </div>
          
          <MemberManagement 
            householdId={activeHousehold.id}
            isOwner={activeHousehold.created_by === user?.id}
          />
        </div>
      </div>
    )
  }

  // No households state
  if (households.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg text-center py-12">
            <CardContent>
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Willkommen bei {APP_CONFIG.name}! 🏠
              </h3>
              <p className="text-gray-600 mb-6">
                {APP_CONFIG.tagline} - Erstelle deinen ersten Haushalt und lass uns gemeinsam deinen Umzug planen.
              </p>
              <Button onClick={() => setViewMode('onboarding')} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Ersten Haushalt erstellen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {APP_CONFIG.name}<span className="text-blue-600"> Dashboard</span>
              </h1>
              <p className="text-gray-600">
                Willkommen zurück, {user?.user_metadata?.full_name || user?.email}!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setViewMode('onboarding')} size="sm" className="bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Neuer Haushalt
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-6">
          <DashboardHero 
            household={activeHousehold}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Row - Urgent Tasks and Address */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UrgentTasksWidget
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onViewAllTasks={() => setViewMode('task-list')}
              />
              <AddressOverview household={activeHousehold} />
            </div>

            {/* Quick Actions */}
            <QuickActions
              onCreateTask={() => setShowCreateTask(true)}
              onInviteMembers={() => setViewMode('member-management')}
              onOpenChecklist={() => setViewMode('task-list')}
              onManageBoxes={() => {
                toast({
                  title: 'Karton-Management',
                  description: 'Diese Funktion wird bald verfügbar sein.',
                })
              }}
              onPlanSchedule={() => {
                toast({
                  title: 'Terminplanung',
                  description: 'Diese Funktion wird bald verfügbar sein.',
                })
              }}
              onOpenTimeline={() => setViewMode('timeline')}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <InsightsSidebar 
              household={activeHousehold}
              upcomingTasks={upcomingTasks}
            />
          </div>
        </div>

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
          date={new Date()}
          onCreate={async (title: string) => {
            await handleCreateTask({ title, phase: 'vor_umzug', priority: 'mittel' })
          }}
        />

        {/* Floating Chat Button */}
        <FloatingChatButton household={activeHousehold} />
      </div>
    </div>
  )
}
