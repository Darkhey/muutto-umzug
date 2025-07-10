import { ExtendedHousehold } from '@/types/household'
import { Database } from '@/types/database'
import { DashboardHero } from './DashboardHero'
import { UrgentTasksWidget } from './UrgentTasksWidget'
import { AddressOverview } from './AddressOverview'
import { QuickActions } from './QuickActions'
import { InsightsSidebar } from './InsightsSidebar'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { FloatingChatButton } from '@/components/ai/FloatingChatButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Plus, LogOut } from 'lucide-react'
import { APP_CONFIG } from '@/config/app'
import { useToast } from '@/hooks/use-toast'

type Task = Database['public']['Tables']['tasks']['Row']

interface DashboardLayoutProps {
  user: any
  households: any[]
  activeHousehold: ExtendedHousehold | null
  tasks: Task[]
  totalTasks: number
  completedTasks: number
  upcomingTasks: any[]
  showCreateTask: boolean
  setShowCreateTask: (show: boolean) => void
  onToggleTask: (taskId: string, completed: boolean) => void
  onCreateTask: (taskData: any) => void
  onViewMode: (mode: 'dashboard' | 'onboarding' | 'onboarding-success' | 'task-list' | 'timeline' | 'member-management') => void
  onSignOut: () => void
}

export const DashboardLayout = ({
  user,
  households,
  activeHousehold,
  tasks,
  totalTasks,
  completedTasks,
  upcomingTasks,
  showCreateTask,
  setShowCreateTask,
  onToggleTask,
  onCreateTask,
  onViewMode,
  onSignOut
}: DashboardLayoutProps) => {
  const { toast } = useToast()

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
              <Button onClick={() => onViewMode('onboarding')} size="lg" className="bg-blue-600 hover:bg-blue-700">
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
            <Button onClick={() => onViewMode('onboarding')} size="sm" className="bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Neuer Haushalt
            </Button>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
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
                onToggleTask={onToggleTask}
                onViewAllTasks={() => onViewMode('task-list')}
              />
              <AddressOverview household={activeHousehold} />
            </div>

            {/* Quick Actions */}
            <QuickActions
              onCreateTask={() => setShowCreateTask(true)}
              onInviteMembers={() => onViewMode('member-management')}
              onOpenChecklist={() => onViewMode('task-list')}
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
              onOpenTimeline={() => onViewMode('timeline')}
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
            await onCreateTask({ title, phase: 'vor_umzug', priority: 'mittel' })
          }}
        />

        {/* Floating Chat Button */}
        <FloatingChatButton household={activeHousehold} />
      </div>
    </div>
  )
}