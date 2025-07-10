import { useAuth } from '@/contexts/AuthContext'
import { useDashboardState } from '@/hooks/useDashboardState'
import { DashboardViews } from './DashboardViews'
import { DashboardLayout } from './DashboardLayout'

export const ImprovedDashboard = () => {
  const { signOut } = useAuth()
  const {
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
    completedTasks,
    totalTasks,
    upcomingTasks,
    handleOnboardingComplete,
    handleOnboardingSuccessComplete,
    handleCreateTask,
    handleToggleTask
  } = useDashboardState()

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
  const dashboardView = (
    <DashboardViews
      viewMode={viewMode}
      activeHousehold={activeHousehold}
      onboardingData={onboardingData}
      userId={user?.id}
      onOnboardingComplete={handleOnboardingComplete}
      onOnboardingSuccessComplete={handleOnboardingSuccessComplete}
      onBackToDashboard={() => setViewMode('dashboard')}
    />
  )

  if (dashboardView) {
    return dashboardView
  }

  // Main Dashboard Layout
  return (
    <DashboardLayout
      user={user}
      households={households}
      activeHousehold={activeHousehold}
      tasks={tasks}
      totalTasks={totalTasks}
      completedTasks={completedTasks}
      upcomingTasks={upcomingTasks}
      showCreateTask={showCreateTask}
      setShowCreateTask={setShowCreateTask}
      onToggleTask={handleToggleTask}
      onCreateTask={handleCreateTask}
      onViewMode={(mode) => setViewMode(mode)}
      onSignOut={signOut}
    />
  )
}
