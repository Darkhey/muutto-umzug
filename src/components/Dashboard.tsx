import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, CheckCircle, Calendar, Plus, Home, LogOut, Clock, AlertCircle, Bot, TrendingUp, Bell } from 'lucide-react'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { InviteOnboarding } from './onboarding/InviteOnboarding'
import { usePendingInvitations } from '@/hooks/usePendingInvitations'
import { HouseholdOverview } from './household/HouseholdOverview'
import { MemberManagement } from './household/MemberManagement'
import { EditHouseholdForm } from './household/EditHouseholdForm'
import { TaskList } from './TaskList'
import { AIAssistant } from './ai/AIAssistant'
import { MovingInsights } from './insights/MovingInsights'
import { ReminderSystem } from './reminders/ReminderSystem'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthPage } from './auth/AuthPage'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'
import { APP_CONFIG, getRandomTip } from '@/config/app'
import { calculateHouseholdProgress, getProgressColor } from '@/utils/progressCalculator'
import { WorkInProgressCard } from './WorkInProgressCard'

type ViewMode =
  | 'dashboard'
  | 'household-overview'
  | 'member-management'
  | 'task-list'
  | 'onboarding'

export const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth()
  const { households, loading, createHousehold, addMembers, updateHousehold } = useHouseholds()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [activeHousehold, setActiveHousehold] = useState<ExtendedHousehold | null>(null)
  const [dailyTip] = useState(getRandomTip())
  const [showEditDialog, setShowEditDialog] = useState(false)
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

  const handleOnboardingComplete = async (data: any) => {
    try {
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
        furniture_volume: data.furnitureVolume
      })

      // Add members if any
      if (data.members && data.members.length > 0) {
        const validMembers = data.members.filter((m: any) => m.name.trim() && m.email.trim())
        if (validMembers.length > 0) {
          await addMembers(household.id, validMembers)
        }
      }

      setViewMode('dashboard')
      
      toast({
        title: "Haushalt erfolgreich erstellt! 🎉",
        description: `Willkommen bei ${APP_CONFIG.name}. Lass uns mit der Planung beginnen.`
      })
    } catch (error) {
      toast({
        title: "Fehler beim Erstellen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleHouseholdUpdate = async (updates: any) => {
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

  const showMemberManagement = () => {
    setViewMode('member-management')
  }

  const backToDashboard = () => {
    setViewMode('dashboard')
    setActiveHousehold(null)
  }

  const getDaysUntilMove = (moveDate: string) => {
    const today = new Date()
    const move = new Date(moveDate)
    const diffTime = move.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (daysUntilMove: number) => {
    if (daysUntilMove < 0) return 'text-red-600'
    if (daysUntilMove <= 7) return 'text-orange-600'
    if (daysUntilMove <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUrgencyIcon = (daysUntilMove: number) => {
    if (daysUntilMove < 0) return <AlertCircle className="h-4 w-4" />
    if (daysUntilMove <= 7) return <Clock className="h-4 w-4" />
    return <Calendar className="h-4 w-4" />
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
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={() => setViewMode('dashboard')}
      />
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
                {getUrgencyIcon(nextDeadline)}
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
                  {Math.round(households.reduce((acc, h) => 
                    acc + calculateHouseholdProgress(h.move_date).overall, 0
                  ) / (households.length || 1))}%
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
                  {households.map((household) => {
                    const progressMetrics = calculateHouseholdProgress(household.move_date, 0, 4)
                    const progressColor = getProgressColor(progressMetrics.overall)
                    const daysUntilMove = getDaysUntilMove(household.move_date)
                    
                    return (
                      <Card key={household.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg">{household.name}</span>
                            <Badge variant="secondary" className={progressColor}>
                              {progressMetrics.overall}%
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {getUrgencyIcon(daysUntilMove)}
                            <span>
                              Umzug: {new Date(household.move_date).toLocaleDateString('de-DE')}
                              {daysUntilMove > 0 && ` (in ${daysUntilMove} Tagen)`}
                              {daysUntilMove === 0 && ` (heute!)`}
                              {daysUntilMove < 0 && ` (überfällig)`}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Fortschritt</span>
                                <span>{progressMetrics.overall}%</span>
                              </div>
                              <Progress value={progressMetrics.overall} className="h-2" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-1" />
                                {household.household_size} {household.household_size === 1 ? 'Person' : 'Personen'}
                                {household.children_count > 0 && `, ${household.children_count} Kinder`}
                                {household.pets_count > 0 && `, ${household.pets_count} Haustiere`}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openTaskList(household)}
                                >
                                  Aufgaben
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => openHousehold(household)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Öffnen
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
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

              {/* Modules Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WorkInProgressCard title="Verträge" icon="💳" />
                <WorkInProgressCard title="Inventar" icon="📦" />
                <WorkInProgressCard title="Rechtliches" icon="⚖️" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Assistant */}
              <AIAssistant household={households[0]} />
              
              {/* Reminders */}
              <ReminderSystem householdId={households[0]?.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}