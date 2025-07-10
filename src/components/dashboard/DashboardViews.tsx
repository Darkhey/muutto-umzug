import { ExtendedHousehold } from '@/types/household'
import { OnboardingFlowWithDrafts } from '@/components/onboarding/OnboardingFlowWithDrafts'
import { OnboardingSuccess } from '@/components/onboarding/OnboardingSuccess'
import { TaskList } from '@/components/TaskList'
import { TimelineView } from '@/components/timeline/TimelineView'
import { MemberManagement } from '@/components/household/MemberManagement'
import { Button } from '@/components/ui/button'
import { CreateHouseholdFormData } from '@/hooks/useHouseholds'

type ViewMode = 'dashboard' | 'onboarding' | 'onboarding-success' | 'task-list' | 'timeline' | 'member-management'

interface DashboardViewsProps {
  viewMode: ViewMode
  activeHousehold: ExtendedHousehold | null
  onboardingData: { householdName: string; moveDate: string } | null
  userId?: string
  onOnboardingComplete: (data: CreateHouseholdFormData) => Promise<void>
  onOnboardingSuccessComplete: () => void
  onBackToDashboard: () => void
}

export const DashboardViews = ({
  viewMode,
  activeHousehold,
  onboardingData,
  userId,
  onOnboardingComplete,
  onOnboardingSuccessComplete,
  onBackToDashboard
}: DashboardViewsProps) => {
  if (viewMode === 'onboarding') {
    return (
      <OnboardingFlowWithDrafts 
        onComplete={onOnboardingComplete}
        onSkip={onBackToDashboard}
      />
    )
  }

  if (viewMode === 'onboarding-success' && onboardingData) {
    return (
      <OnboardingSuccess
        householdName={onboardingData.householdName}
        moveDate={onboardingData.moveDate}
        onContinue={onOnboardingSuccessComplete}
      />
    )
  }

  if (viewMode === 'task-list' && activeHousehold) {
    return (
      <TaskList 
        household={activeHousehold} 
        onBack={onBackToDashboard} 
      />
    )
  }

  if (viewMode === 'timeline' && activeHousehold) {
    return (
      <TimelineView 
        household={activeHousehold} 
        onBack={onBackToDashboard} 
      />
    )
  }

  if (viewMode === 'member-management' && activeHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBackToDashboard} className="mr-4">
              ← Zurück zum Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mitglieder verwalten</h1>
          </div>
          
          <MemberManagement 
            householdId={activeHousehold.id}
            isOwner={activeHousehold.created_by === userId}
          />
        </div>
      </div>
    )
  }

  return null
}