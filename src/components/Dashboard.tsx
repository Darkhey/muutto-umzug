import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, CheckCircle, Calendar, Plus, Home, LogOut, Bot, Bell, Bug } from 'lucide-react'
import { OnboardingFlowWithDrafts } from './onboarding/OnboardingFlowWithDrafts'
import { OnboardingSuccess } from './onboarding/OnboardingSuccess'
import { InviteOnboarding } from './onboarding/InviteOnboarding'
import { usePendingInvitations } from '@/hooks/usePendingInvitations'
import { HouseholdOverview } from './household/HouseholdOverview'
import { MemberManagement } from './household/MemberManagement'
import { EditHouseholdForm } from './household/EditHouseholdForm'
import { TaskList } from './TaskList'
import { AIAssistant } from './ai/AIAssistant'
import { MovingInsights } from './insights/MovingInsights'
import { ReminderSystem } from './reminders/ReminderSystem'
import { TestRunner } from './testing/TestRunner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthPage } from './auth/AuthPage'
import { HouseholdCard } from './households/HouseholdCard'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold, CreateHouseholdData, OnboardingData } from '@/types/household'
import { APP_CONFIG, getRandomTip } from '@/config/app'
import { calculateHouseholdProgress, getProgressColor } from '@/utils/progressCalculator'
import { getDaysUntilMove, getUrgencyColor, getUrgencyIcon } from '@/utils/moveDate'
import { WorkInProgressCard } from './WorkInProgressCard'
import { supabase } from '@/integrations/supabase/client'
import { TimelineView } from './timeline/TimelineView'
import { TimelineButton } from './timeline/TimelineButton'

type ViewMode =
  | 'dashboard'
  | 'household-overview'
  | 'member-management'
  | 'task-list'
  | 'timeline-view'
  | 'onboarding'
  | 'onboarding-success'
  | 'testing'

export const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth()
  const { households, loading, createHousehold, addMembers, updateHousehold } = useHouseholds()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [activeHousehold, setActiveHousehold] = useState<ExtendedHousehold | null>(null)
  const [dailyTip] = useState(getRandomTip())
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [householdProgress, setHouseholdProgress] = useState<Record<string, number>>({})
  const { invitations, loading: inviteLoading, error: inviteError, refetch: refetchInvites } = usePendingInvitations()

  useEffect(() => {
    if (inviteError) {
      toast({
        title: 'Fehler beim Laden der Einladungen',
        description: inviteError.message,
        variant: 'destructive'
      })
    }
  }, [inviteError, toast])

  // Optimized task fetching with single bulk query
  useEffect(() => {
    const fetchAllHouseholdProgress = async () => {
      if (households.length === 0) return

      try {
        // Single query for all households' tasks
        const { data: allTasks } = await supabase
          .from('tasks')
          .select('household_id, completed')
          .in('household_id', households.map(h => h.id))

        if (!allTasks) return

        // Group by household and calculate progress in memory
        const progressByHousehold = allTasks.reduce((acc, task) => {
          const { household_id, completed } = task
          if (!acc[household_id]) {
            acc[household_id] = { total: 0, completed: 0 }
          }
          acc[household_id].total++
          if (completed) acc[household_id].completed++
          return acc
        }, {} as Record<string, { total: number, completed: number }>)

        // Calculate progress percentages for each household
        const progressMap: Record<string, number> = {}
        
        for (const household of households) {
          const stats = progressByHousehold[household.id]
          if (stats && stats.total > 0) {
            const progressMetrics = calculateHouseholdProgress(
              household.move_date,
              stats.completed,
              stats.total
            )
            progressMap[household.id] = progressMetrics.overall
          } else {
            progressMap[household.id] = 0
          }
        }

        setHouseholdProgress(progressMap)
      } catch (error) {
        console.error('Failed to fetch household progress:', error)
        toast({
          title: 'Fehler beim Laden des Fortschritts',
          description: 'Der Fortschritt konnte nicht geladen werden.',
          variant: 'destructive'
        })
      }
    }

    fetchAllHouseholdProgress()
  }, [households, toast])

  // Show auth page if not logged in
  if (!authLoading && !user) {
    return <AuthPage />
  }

  // Loading state
  if (authLoading || loading || inviteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      setOnboardingData(data)
      
      console.log("Onboarding data received:", data);
      
      const household = await createHousehold({
        name: data.householdName,
        move_date: data.moveDate,
        household_size: data.householdSize,
        children_count: data.childrenCount,
        pets_count: data.petsCount,
        property_type: data.propertyType,
        postal_code: data.postalCode,
        old_address: data.oldAddress,
        new_address: data.newAddress,
        living_space: data.livingSpace,
        rooms: data.rooms,
        furniture_volume: data.furnitureVolume,
        owns_car: data.ownsCar,
        is_self_employed: data.isSelfEmployed,
        ad_url: data.adUrl || null
      })

      console.log("Household created:", household);

      // Generate personalized tasks
      if (user?.id) {
        const { data: generatedTasks, error: rpcError } = await supabase.rpc('generate_personalized_tasks', {
          p_user_id: user.id,
          p_move_from_state: data.oldAddress || '', // Assuming state can be derived or is not critical for now
          p_move_to_state: data.newAddress || '', // Assuming state can be derived or is not critical for now
          p_move_to_municipality: data.postalCode || '', // Using postal code as municipality for now
          p_has_children: data.childrenCount > 0,
          p_has_pets: data.petsCount > 0,
          p_owns_car: data.ownsCar || false,
          p_is_self_employed: data.isSelfEmployed || false
        })

        if (rpcError) {
          console.error("Error generating personalized tasks:", rpcError);
          toast({
            title: "Fehler bei der Aufgabengenerierung",
            description: rpcError.message,
            variant: "destructive"
          })
        } else {
          console.log("Personalized tasks generated:", generatedTasks);
        }
      }

      // Set the newly created household as active so we can show its tasks
      setActiveHousehold(household)

      // Add members if any
      if (data.members && data.members.length > 0) {
        const validMembers = data.members.filter((m: { name: string; email: string }) => m.name.trim() && m.email.trim())
        if (validMembers.length > 0) {
          await addMembers(household.id, validMembers)
        }
      }

      // Show success screen
      setViewMode('onboarding-success')
      
    } catch (error) {
      console.error("Error in handleOnboardingComplete:", error);
      toast({
        title: "Fehler beim Erstellen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleOnboardingSuccessComplete = () => {
    if (activeHousehold) {
      // Jump directly to the task list so the user can review the generated checklist
      setViewMode('task-list')
    } else {
      setViewMode('dashboard')
    }

    toast({
      title: "Willkommen bei muutto! 🎉",
      description: `Dein Haushalt "${onboardingData?.householdName}" ist bereit. Lass uns mit der Planung beginnen!`
    })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleHouseholdUpdate = async (updates: Partial<CreateHouseholdData>) => {
    if (!activeHousehold) return

    try {
      const updated = await updateHousehold(activeHousehold.id, updates)
      setActiveHousehold({ ...activeHousehold, ...updated })
      setShowEditDialog(false)
      toast({
        title: 'Haushalt aktualisiert',
        description: 'Die Änderungen wurden gespeichert.'
      })
    } catch (error) {
      toast({
        title: 'Fehler beim Aktualisieren',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      })
    }
  }

  const openHousehold = (household: ExtendedHousehold) => {
    setActiveHousehold(household)
    setViewMode('household-overview')
  }

  const openTaskList = (household: ExtendedHousehold) => {
    setActiveHousehold(household)
    setViewMode('task-list')
  }
  
  const openTimelineView = (household: ExtendedHousehold) => {
    setActiveHousehold(household)
    setViewMode('timeline-view')
  }

  const showMemberManagement = () => {
    setViewMode('member-management')
  }

  const backToDashboard = () => {
    setViewMode('dashboard')
    setActiveHousehold(null)
  }

  if (viewMode === 'dashboard' && invitations.length > 0) {
    return (
      <InviteOnboarding
        invitation={invitations[0]}
        onComplete={() => {
          refetchInvites()
          setViewMode('dashboard')
        }}
      />
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

  if (viewMode === 'testing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={backToDashboard} className="mr-4">
              ← Zurück zum Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Test Suite</h1>
          </div>
          
          <TestRunner />
        </div>
      </div>
    )
  }

  if (viewMode === 'household-overview' && activeHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={backToDashboard} className="mr-4">
              ← Zurück zum Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Haushalt verwalten</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HouseholdOverview
                household={activeHousehold}
                onManageMembers={showMemberManagement}
                onEditHousehold={() => setShowEditDialog(true)}
                onViewTasks={() => openTaskList(activeHousehold)}
                onRestartOnboarding={() => setViewMode('onboarding')}
              />
            </div>
            
            <div className="space-y-6">
              <MovingInsights household={activeHousehold} />
              <AIAssistant household={activeHousehold} />
            </div>
          </div>

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Haushalt bearbeiten</DialogTitle>
              </DialogHeader>
              <EditHouseholdForm
                household={activeHousehold}
                onSubmit={handleHouseholdUpdate}
                onCancel={() => setShowEditDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  if (viewMode === 'member-management' && activeHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setViewMode('household-overview')} className="mr-4">
              ← Zurück zur Übersicht
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

  if (viewMode === 'task-list' && activeHousehold) {
    return (
      <TaskList household={activeHousehold} onBack={() => setViewMode('household-overview')} />
    )
  }
  
  if (viewMode === 'timeline-view' && activeHousehold) {
    return (
      <TimelineView household={activeHousehold} onBack={() => setViewMode('household-overview')} />
    )
  }

  const totalHouseholds = households.length
  const nextDeadline = households.length > 0 
    ? getDaysUntilMove(households[0].move_date)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {APP_CONFIG.name}<span className="text-blue-600"> Dashboard</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Willkommen zurück, {user?.user_metadata?.full_name || user?.email}!
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('testing')}
              className="text-purple-600 hover:text-purple-700"
            >
              <Bug className="h-4 w-4 mr-2" />
              Tests
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {households.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Umzüge</CardTitle>
                <Home className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalHouseholds}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nächster Umzug</CardTitle>
                {React.createElement(getUrgencyIcon(nextDeadline), { className: "h-4 w-4" })}
              </CardHeader>
              <CardContent>
                <div className={`text-sm font-bold ${getUrgencyColor(nextDeadline)}`}>
                  {nextDeadline > 0 ? `in ${nextDeadline} Tagen` : nextDeadline === 0 ? 'Heute!' : 'Überfällig'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Durchschnitt</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {households.length > 0 ?
                    Math.round(
                      households.reduce((acc, h) => acc + (householdProgress[h.id] || 0), 0) /
                      households.length
                    ) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {households.length === 0 ? (
          <Card className="bg-white shadow-lg text-center py-12">
            <CardContent>
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Willkommen bei {APP_CONFIG.name}! 🏠
              </h3>
              <p className="text-gray-600 mb-6">
                {APP_CONFIG.tagline} - Erstelle deinen ersten Haushalt und lass uns gemeinsam deinen Umzug planen.
              </p>
              <Button 
                onClick={() => setViewMode('onboarding')} 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ersten Haushalt erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="households" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger value="households">Haushalte</TabsTrigger>
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
            </TabsList>

            <TabsContent value="households" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Households Grid */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Deine Haushalte</h2>
                      <Button 
                        onClick={() => setViewMode('onboarding')} 
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Neuer Haushalt
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {households.map(household => (
                        <HouseholdCard
                          key={household.id}
                          household={household}
                          progress={householdProgress[household.id] || 0}
                          onOpenHousehold={openHousehold}
                          onOpenTaskList={openTaskList}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Daily Tip */}
                  <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardHeader>
                      <CardTitle className="text-white">💡 Tipp des Tages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{dailyTip}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* AI Assistant */}
                  <AIAssistant household={households[0]} />
                  
                  {/* Reminders */}
                  <ReminderSystem householdId={households[0]?.id} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              {/* Modules Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WorkInProgressCard title="Verträge" icon="💳" />
                <WorkInProgressCard title="Inventar" icon="📦" />
                <WorkInProgressCard title="Rechtliches" icon="⚖️" />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
