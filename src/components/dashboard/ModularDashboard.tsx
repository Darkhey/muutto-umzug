import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  Users, 
  CheckCircle, 
  Calendar, 
  Plus, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  Bot, 
  TrendingUp, 
  Bell,
  Settings,
  MapPin,
  Map as DashboardMap,
  CreditCard,
  FileText,
  Package,
  Scale,
  Truck,
  Sparkles,
  Merge,
  Grid3X3,
  RotateCcw
} from 'lucide-react'

import { EnhancedResponsiveGrid } from './ResponsiveGridLayout'
import { EnhancedModuleCard } from './EnhancedModuleCard'
import { useEnhancedDashboardModules, DashboardModule } from '@/hooks/useEnhancedDashboardModules'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'
import { APP_CONFIG } from '@/config/app'
import MapModule from '@/components/maps/MapModule'
import { DashboardStats } from './DashboardStats'
import { HouseholdMergerButton } from './HouseholdMergerButton'
import { OnboardingFlowWithDrafts } from '@/components/onboarding/OnboardingFlowWithDrafts'
import { OnboardingSuccess } from '@/components/onboarding/OnboardingSuccess'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { ReminderSystem } from '@/components/reminders/ReminderSystem'
import { MovingInsights } from '@/components/insights/MovingInsights'
import { HouseholdOverview } from '../household/HouseholdOverview'
import { MemberManagement } from '../household/MemberManagement'

export const ModularDashboard = () => {
  const { user, signOut } = useAuth()
  const { households, loading, createHousehold, addMembers } = useHouseholds()
  const { toast } = useToast()
  const [activeHousehold, setActiveHousehold] = useState<ExtendedHousehold | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [viewMode, setViewMode] = useState<'dashboard' | 'onboarding' | 'onboarding-success' | 'household-overview' | 'member-management'>('dashboard')
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [navigationLoading, setNavigationLoading] = useState(false)
  
  // Aggregated statistics state
  const [totalTasks, setTotalTasks] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  const [averageProgress, setAverageProgress] = useState(0)

  // Initialize modules based on the first household
  const [initialModules, setInitialModules] = useState<DashboardModule[]>([])
  
  useEffect(() => {
    if (households && households.length > 0) {
      const firstHousehold = households[0]
      setActiveHousehold(firstHousehold)
      
      const modules: DashboardModule[] = [
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openHousehold(firstHousehold)}
                disabled={navigationLoading}
              >
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
          id: 'tasks',
          title: 'Aufgaben',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Nächste Aufgaben</h3>
                <Button variant="ghost" size="sm">Alle anzeigen</Button>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Mietvertrag kündigen', date: '15.07.2025', priority: 'high' },
                  { title: 'Umzugsunternehmen buchen', date: '01.08.2025', priority: 'medium' },
                  { title: 'Strom ummelden', date: '15.08.2025', priority: 'low' }
                ].map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.date}</p>
                    </div>
                    <Badge variant="outline" className={
                      task.priority === 'high' ? 'bg-red-50 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                      'bg-green-50 text-green-800'
                    }>
                      {task.priority === 'high' ? 'Hoch' : 
                       task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ),
          enabled: true,
          category: 'primary',
          description: 'Verwalte deine Umzugsaufgaben und To-Dos',
          size: 'medium'
        },
        {
          id: 'ai-assistant',
          title: 'KI-Assistent',
          icon: <Bot className="h-5 w-5 text-indigo-600" />,
          component: <AIAssistant household={firstHousehold} />,
          enabled: true,
          category: 'primary',
          description: 'Dein persönlicher KI-Assistent für Umzugsfragen',
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
          id: 'costs',
          title: 'Kosten & Budget',
          icon: <CreditCard className="h-5 w-5 text-purple-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Budget-Übersicht</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-800">
                  Geschätzt
                </Badge>
              </div>
              <div className="space-y-2">
                {[
                  { category: 'Umzugsunternehmen', amount: '1.200 €', status: 'planned' },
                  { category: 'Kaution', amount: '1.800 €', status: 'planned' },
                  { category: 'Renovierung', amount: '500 €', status: 'planned' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <p className="font-medium text-sm">{item.category}</p>
                    <p className="font-semibold text-purple-700">{item.amount}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">Budget bearbeiten</Button>
            </div>
          ),
          enabled: false,
          category: 'secondary',
          description: 'Behalte den Überblick über deine Umzugskosten',
          size: 'medium'
        },
        {
          id: 'contracts',
          title: 'Verträge',
          icon: <FileText className="h-5 w-5 text-yellow-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Wichtige Verträge</h3>
                <Button variant="ghost" size="sm">Hinzufügen</Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Mietvertrag', status: 'active', date: '01.01.2025' },
                  { name: 'Stromvertrag', status: 'pending', date: '01.09.2025' },
                  { name: 'Internet', status: 'pending', date: '15.09.2025' }
                ].map((contract, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{contract.name}</p>
                      <p className="text-xs text-gray-500">Gültig ab: {contract.date}</p>
                    </div>
                    <Badge variant="outline" className={
                      contract.status === 'active' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                    }>
                      {contract.status === 'active' ? 'Aktiv' : 'Ausstehend'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ),
          enabled: false,
          category: 'secondary',
          description: 'Verwalte deine Verträge und Kündigungsfristen',
          size: 'medium'
        },
        {
          id: 'inventory',
          title: 'Inventar',
          icon: <Package className="h-5 w-5 text-amber-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Inventar-Übersicht</h3>
                <Button variant="ghost" size="sm">Hinzufügen</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">12</p>
                  <p className="text-xs text-amber-800">Kartons</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">4</p>
                  <p className="text-xs text-amber-800">Räume</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">35</p>
                  <p className="text-xs text-amber-800">Gegenstände</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">2</p>
                  <p className="text-xs text-amber-800">Fahrzeuge</p>
                </div>
              </div>
            </div>
          ),
          enabled: false,
          category: 'secondary',
          description: 'Behalte den Überblick über dein Inventar und Kartons',
          size: 'medium'
        },
        {
          id: 'legal',
          title: 'Rechtliches',
          icon: <Scale className="h-5 w-5 text-blue-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Rechtliche Anforderungen</h3>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Ummeldung Einwohnermeldeamt', deadline: '14 Tage nach Einzug', status: 'pending' },
                  { name: 'Kfz-Ummeldung', deadline: '14 Tage nach Einzug', status: 'pending' },
                  { name: 'Nachsendeauftrag', deadline: '2 Wochen vor Umzug', status: 'completed' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Frist: {item.deadline}</p>
                    </div>
                    <Badge variant="outline" className={
                      item.status === 'completed' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
                    }>
                      {item.status === 'completed' ? 'Erledigt' : 'Ausstehend'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ),
          enabled: false,
          category: 'secondary',
          description: 'Informationen zu rechtlichen Anforderungen und Fristen',
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
          component: (
            <MapModule latitude={52.52} longitude={13.405} />
          ),
          enabled: true,
          category: 'primary',
          description: 'Interaktive Karte mit wichtigen Orten',
          size: 'large'
        },
        {
          id: 'weather',
          title: 'Wetter am Umzugstag',
          icon: <Cloud className="h-5 w-5 text-sky-600" />,
          component: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Wettervorhersage</h3>
                <Badge variant="outline" className="bg-sky-50 text-sky-800">
                  {new Date(firstHousehold.move_date).toLocaleDateString('de-DE')}
                </Badge>
              </div>
              <div className="flex items-center justify-center p-4 bg-sky-50 rounded-lg">
                <div className="text-center">
                  <Sun className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-sky-800">22°C</p>
                  <p className="text-sm text-sky-700">Sonnig, leicht bewölkt</p>
                  <p className="text-xs text-sky-600 mt-1">Regenwahrscheinlichkeit: 10%</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Wettervorhersagen werden 7 Tage vor dem Umzug genauer
              </p>
            </div>
          ),
          enabled: false,
          category: 'utility',
          description: 'Zeigt die Wettervorhersage für deinen Umzugstag',
          size: 'small'
        }
      ]
      
      setInitialModules(modules)
    } else {
      setActiveHousehold(null)
      setInitialModules([])
    }
  }, [households])

  const {
    modules,
    layouts,
    settings,
    toggleModule,
    handleLayoutChange,
    compactLayout,
    resetLayout,
    updateSetting,
    saveSettings
  } = useEnhancedDashboardModules(initialModules)

  const handleOnboardingComplete = async (data: any) => {
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
        const validMembers = data.members.filter((m: any) => m.name.trim() && m.email.trim())
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
    setNavigationLoading(true)
    setActiveHousehold(household)
    setViewMode('household-overview')
    setNavigationLoading(false)
  }

  const showMemberManagement = () => {
    setViewMode('member-management')
  }

  const backToDashboard = () => {
    setViewMode('dashboard')
    setActiveHousehold(null)
  }

  // Show auth page if not logged in
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
              />
            </div>

            <div className="space-y-6">
              <MovingInsights household={activeHousehold} />
              <AIAssistant household={activeHousehold} />
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
        </div>
      </div>
    )
  }

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
              variant="outline" 
              size="sm"
              onClick={compactLayout}
              className="text-blue-600 hover:text-blue-700"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Komprimieren
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetLayout}
              className="text-gray-600 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats 
          households={households}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          averageProgress={averageProgress}
        />

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="modules">Module verwalten</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Household Management Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Deine Module</h2>
              <div className="flex gap-2">
                <HouseholdMergerButton 
                  variant="outline"
                  onMergeComplete={() => {
                    toast({
                      title: 'Haushalte zusammengeführt',
                      description: 'Die Haushalte wurden erfolgreich zusammengeführt.'
                    })
                  }}
                />
                <Button 
                  onClick={() => setViewMode('onboarding')} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neuer Haushalt
                </Button>
              </div>
            </div>

            {/* Enhanced Grid Layout */}
            <div className="min-h-[600px]">
              <EnhancedResponsiveGrid
                layouts={layouts}
                onLayoutChange={handleLayoutChange}
              >
                {modules
                  .filter(module => module.enabled)
                  .map(module => (
                    <div key={module.id}>
                      <EnhancedModuleCard
                        {...module}
                        onToggle={toggleModule}
                      />
                    </div>
                  ))}
              </EnhancedResponsiveGrid>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Verfügbare Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Primäre Module</h3>
                    <div className="space-y-2">
                      {modules
                        .filter(module => module.category === 'primary')
                        .map(module => (
                          <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {module.icon}
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-sm text-gray-600">{module.description}</p>
                              </div>
                            </div>
                            <Switch 
                              checked={module.enabled} 
                              onCheckedChange={() => toggleModule(module.id)} 
                              id={`toggle-list-${module.id}`}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Sekundäre Module</h3>
                    <div className="space-y-2">
                      {modules
                        .filter(module => module.category === 'secondary')
                        .map(module => (
                          <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {module.icon}
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-sm text-gray-600">{module.description}</p>
                              </div>
                            </div>
                            <Switch 
                              checked={module.enabled} 
                              onCheckedChange={() => toggleModule(module.id)} 
                              id={`toggle-list-${module.id}`}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Utility Module</h3>
                    <div className="space-y-2">
                      {modules
                        .filter(module => module.category === 'utility')
                        .map(module => (
                          <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {module.icon}
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-sm text-gray-600">{module.description}</p>
                              </div>
                            </div>
                            <Switch 
                              checked={module.enabled} 
                              onCheckedChange={() => toggleModule(module.id)} 
                              id={`toggle-list-${module.id}`}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Dashboard-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Layout-Einstellungen</h3>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Kompaktes Layout</p>
                        <p className="text-sm text-gray-600">Module automatisch nach oben verschieben</p>
                      </div>
                      <Switch 
                        checked={settings.compactLayout}
                        onCheckedChange={(checked) => updateSetting('compactLayout', checked)}
                        id="compact-layout" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Magnetisches Grid</p>
                        <p className="text-sm text-gray-600">Module docken automatisch an verfügbare Positionen</p>
                      </div>
                      <Switch 
                        checked={settings.magneticGrid}
                        onCheckedChange={(checked) => updateSetting('magneticGrid', checked)}
                        id="magnetic-grid" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Kategorie-Badges anzeigen</p>
                        <p className="text-sm text-gray-600">Zeigt farbige Badges für Modul-Kategorien</p>
                      </div>
                      <Switch 
                        checked={settings.showCategoryBadges}
                        onCheckedChange={(checked) => updateSetting('showCategoryBadges', checked)}
                        id="category-badges" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetLayout}>
                      Layout zurücksetzen
                    </Button>
                    <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
                      Einstellungen speichern
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Additional icon components
const Cloud = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
)

const Sun = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)

export default ModularDashboard
