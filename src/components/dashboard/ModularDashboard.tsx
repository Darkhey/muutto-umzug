import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, CheckCircle, Bell, TrendingUp, MapPin, Map as DashboardMap, Truck, Plus, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'
import { APP_CONFIG } from '@/config/app'
import MapModule from '@/components/maps/MapModule'
import { DashboardStats } from './DashboardStats'
import { OnboardingFlowWithDrafts } from '@/components/onboarding/OnboardingFlowWithDrafts'
import { OnboardingSuccess } from '@/components/onboarding/OnboardingSuccess'
import { ReminderSystem } from '@/components/reminders/ReminderSystem'
import { MovingInsights } from '@/components/insights/MovingInsights'
import { HouseholdOverview } from '../household/HouseholdOverview'
import { MemberManagement } from '../household/MemberManagement'
import { ChecklistView } from '../checklist/ChecklistView'
import SimpleModuleCard from './SimpleModuleCard'
import type { DashboardModule } from '@/hooks/useEnhancedDashboardModules'

export const ModularDashboard = () => {
  const { user, signOut } = useAuth()
  const { households, loading, createHousehold, addMembers } = useHouseholds()
  const { toast } = useToast()
  const [activeHousehold, setActiveHousehold] = useState<ExtendedHousehold | null>(null)
  const [viewMode, setViewMode] = useState<'dashboard' | 'onboarding' | 'onboarding-success' | 'household-overview' | 'member-management'>('dashboard')
  const [onboardingData, setOnboardingData] = useState<CreateHouseholdData | null>(null)

  const [modules, setModules] = useState<DashboardModule[]>([])

  useEffect(() => {
    if (households && households.length > 0) {
      const firstHousehold = households[0]
      setActiveHousehold(firstHousehold)

      const m: DashboardModule[] = [
        {
          id: 'household-overview',
          title: 'Haushalt Übersicht',
          icon: <Home className="h-5 w-5 text-blue-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{firstHousehold.name}</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  {firstHousehold.property_type === 'miete' ? 'Miete' : 'Eigentum'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Umzugsdatum</p>
                  <p className="font-semibold">{new Date(firstHousehold.move_date).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Haushaltsgröße</p>
                  <p className="font-semibold">{firstHousehold.household_size} Personen</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => openHousehold(firstHousehold)}>
                Details anzeigen
              </Button>
            </div>
          ),
          enabled: true,
          category: 'primary',
          description: 'Zeigt die wichtigsten Informationen zu deinem Haushalt',
          size: 'medium'
        },
        {
          id: 'checklist',
          title: 'Checkliste',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          component: <ChecklistView household={firstHousehold} />,
          enabled: true,
          category: 'primary',
          description: 'Aufgaben & Timeline verwalten',
          size: 'large'
        },
        {
          id: 'reminders',
          title: 'Erinnerungen',
          icon: <Bell className="h-5 w-5 text-orange-600" />,
          component: <ReminderSystem householdId={firstHousehold.id} />,
          enabled: true,
          category: 'primary',
          description: 'Wichtige Erinnerungen und Fristen',
          size: 'medium'
        },
        {
          id: 'insights',
          title: 'Umzugs-Insights',
          icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
          component: <MovingInsights household={firstHousehold} />,
          enabled: true,
          category: 'primary',
          description: 'Statistiken und Insights zu deinem Umzug',
          size: 'medium'
        },
        {
          id: 'locations',
          title: 'Orte & Adressen',
          icon: <MapPin className="h-5 w-5 text-red-600" />,
          component: (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Aktuelle Adresse</p>
                <p className="font-semibold">{firstHousehold.old_address || 'Nicht angegeben'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Neue Adresse</p>
                <p className="font-semibold">{firstHousehold.new_address || 'Nicht angegeben'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Postleitzahl</p>
                <p className="font-semibold">{firstHousehold.postal_code || 'Nicht angegeben'}</p>
              </div>
            </div>
          ),
          enabled: true,
          category: 'secondary',
          description: 'Verwalte deine Adressen und wichtige Orte',
          size: 'medium'
        },
        {
          id: 'moving-day',
          title: 'Umzugstag',
          icon: <Truck className="h-5 w-5 text-green-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Umzugstag-Planung</h3>
                <Badge variant="outline" className="bg-green-50 text-green-800">
                  {new Date(firstHousehold.move_date).toLocaleDateString('de-DE')}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Zeitplan</p>
                  <ul className="text-xs text-green-700 space-y-1 mt-1">
                    <li>• 08:00 - Schlüsselübergabe</li>
                    <li>• 09:00 - Umzugswagen beladen</li>
                    <li>• 12:00 - Transport</li>
                    <li>• 14:00 - Entladen</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Helfer</p>
                  <p className="text-xs text-green-700 mt-1">3 Helfer bestätigt</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">Umzugstag planen</Button>
            </div>
          ),
          enabled: true,
          category: 'secondary',
          description: 'Plane deinen Umzugstag im Detail',
          size: 'medium'
        },
        {
          id: 'map',
          title: 'Karte',
          icon: <DashboardMap className="h-5 w-5 text-green-600" />,
          component: <MapModule household={firstHousehold} />,
          enabled: true,
          category: 'primary',
          description: 'Interaktive Karte mit wichtigen Orten',
          size: 'large'
        }
      ]

      setModules(m)
    } else {
      setActiveHousehold(null)
      setModules([])
    }
  }, [households])

  const handleOnboardingComplete = async (data: CreateHouseholdData) => {
    try {
      setOnboardingData(data)

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

      if (data.members && data.members.length > 0) {
        const validMembers = data.members.filter((m: { name: string; email: string }) => m.name.trim() && m.email.trim())
        if (validMembers.length > 0) {
          await addMembers(household.id, validMembers)
        }
      }

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
      description: `Dein Haushalt "${onboardingData?.householdName}" ist bereit. Lass uns mit der Planung beginnen!`
    })
  }

  const openHousehold = (household: ExtendedHousehold) => {
    setActiveHousehold(household)
    setViewMode('household-overview')
  }

  const showMemberManagement = () => {
    setViewMode('member-management')
  }

  const backToDashboard = () => {
    setViewMode('dashboard')
    setActiveHousehold(null)
  }

  const handleRestartOnboarding = () => {
    setViewMode('onboarding')
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Bitte melde dich an, um das Dashboard zu sehen.</p>
        </div>
      </div>
    )
  }

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
                onEditHousehold={() => {}}
                onViewTasks={() => {}}
                onRestartOnboarding={handleRestartOnboarding}
              />
            </div>

            <div className="space-y-6">
              <MovingInsights household={activeHousehold} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'member-management' && activeHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setViewMode('household-overview')} className="mr-4" aria-label="Zurück zur Haushaltsübersicht">
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

  if (households.length === 0) {
    if (viewMode === 'onboarding') {
      return (
        <OnboardingFlowWithDrafts onComplete={handleOnboardingComplete} onSkip={() => setViewMode('dashboard')} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
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
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        <DashboardStats households={households} totalTasks={0} completedTasks={0} averageProgress={0} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {modules.map(m => (
            <SimpleModuleCard key={m.id} module={m} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModularDashboard
