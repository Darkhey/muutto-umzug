import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  GripVertical,
  MapPin,
  CreditCard,
  FileText,
  Package,
  Scale,
  Truck,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { useToast } from '@/hooks/use-toast'
import { ExtendedHousehold } from '@/types/household'
import { APP_CONFIG } from '@/config/app'
import { calculateHouseholdProgress, getProgressColor } from '@/utils/progressCalculator'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { ReminderSystem } from '@/components/reminders/ReminderSystem'
import { MovingInsights } from '@/components/insights/MovingInsights'

// Define module types
export interface DashboardModule {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  enabled: boolean
  category: 'primary' | 'secondary' | 'utility'
  description: string
  size: 'small' | 'medium' | 'large'
}

// Sortable module component
const SortableModule = ({ module, onToggle }: { 
  module: DashboardModule, 
  onToggle: (id: string) => void 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`mb-6 ${module.size === 'large' ? 'col-span-2' : module.size === 'medium' ? 'col-span-1' : 'col-span-1'}`}
    >
      <Card className={`bg-white shadow-lg ${!module.enabled ? 'opacity-60' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="cursor-move" {...attributes} {...listeners}>
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              {module.icon}
              {module.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={module.enabled} 
              onCheckedChange={() => onToggle(module.id)} 
              id={`toggle-${module.id}`}
            />
            <Label htmlFor={`toggle-${module.id}`} className="text-xs text-gray-500">
              {module.enabled ? 'Aktiv' : 'Inaktiv'}
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          {module.enabled ? (
            module.component
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <p className="mb-4">Dieses Modul ist deaktiviert</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onToggle(module.id)}
              >
                Aktivieren
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const ModularDashboard = () => {
  const { user, signOut } = useAuth()
  const { households, loading } = useHouseholds()
  const { toast } = useToast()
  const [activeHousehold, setActiveHousehold] = useState<ExtendedHousehold | null>(null)
  const [modules, setModules] = useState<DashboardModule[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize modules based on the first household
  useEffect(() => {
    if (households && households.length > 0) {
      const firstHousehold = households[0]
      setActiveHousehold(firstHousehold)
      
      // Create modules
      const initialModules: DashboardModule[] = [
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
              <Button variant="outline" className="w-full">Details anzeigen</Button>
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
      
      setModules(initialModules)
    }
  }, [households])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        return arrayMove(items, oldIndex, newIndex)
      })
      
      toast({
        title: 'Dashboard angepasst',
        description: 'Die Anordnung der Module wurde gespeichert',
      })
    }
  }

  const toggleModule = (id: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === id ? { ...module, enabled: !module.enabled } : module
      )
    )
    
    const module = modules.find(m => m.id === id)
    if (module) {
      toast({
        title: module.enabled ? `${module.title} deaktiviert` : `${module.title} aktiviert`,
        description: module.enabled 
          ? `Das Modul wurde ausgeblendet` 
          : `Das Modul wurde zum Dashboard hinzugefügt`,
      })
    }
  }

  const getDaysUntilMove = (moveDate: string) => {
    const today = new Date()
    const move = new Date(moveDate)
    const diffTime = move.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getUrgencyColor = (daysUntilMove: number) => {
    if (daysUntilMove < 0) return 'text-red-600'
    if (daysUntilMove <= 7) return 'text-orange-600'
    if (daysUntilMove <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUrgencyIcon = (daysUntilMove: number) => {
    if (daysUntilMove < 0) return <AlertTriangle className="h-4 w-4" />
    if (daysUntilMove <= 7) return <Clock className="h-4 w-4" />
    return <Calendar className="h-4 w-4" />
  }

  if (loading || !activeHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt Dashboard...</p>
        </div>
      </div>
    )
  }

  const nextDeadline = getDaysUntilMove(activeHousehold.move_date)

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Umzüge</CardTitle>
              <Home className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{households.length}</div>
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
              <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {calculateHouseholdProgress(activeHousehold.move_date).overall}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">12</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="modules">Module verwalten</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={modules.filter(m => m.enabled).map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules
                    .filter(module => module.enabled)
                    .map(module => (
                      <SortableModule 
                        key={module.id} 
                        module={module} 
                        onToggle={toggleModule} 
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
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
                        <p className="text-sm text-gray-600">Zeigt mehr Module auf einmal an</p>
                      </div>
                      <Switch id="compact-layout" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Automatisches Sortieren</p>
                        <p className="text-sm text-gray-600">Sortiert Module nach Priorität</p>
                      </div>
                      <Switch id="auto-sort" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold">Benachrichtigungen</h3>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">E-Mail-Benachrichtigungen</p>
                        <p className="text-sm text-gray-600">Erhalte wichtige Updates per E-Mail</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Push-Benachrichtigungen</p>
                        <p className="text-sm text-gray-600">Erhalte Echtzeit-Updates im Browser</p>
                      </div>
                      <Switch id="push-notifications" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold">Daten & Privatsphäre</h3>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Anonyme Nutzungsstatistiken</p>
                        <p className="text-sm text-gray-600">Hilf uns, die App zu verbessern</p>
                      </div>
                      <Switch id="usage-stats" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">KI-Personalisierung</p>
                        <p className="text-sm text-gray-600">Personalisierte Tipps vom KI-Assistenten</p>
                      </div>
                      <Switch id="ai-personalization" defaultChecked />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700">
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