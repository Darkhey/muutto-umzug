import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, List, Clock, Plus, Users, Sparkles, Info, Baby, PawPrint, Car, Briefcase, Home, Building } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useTimeline } from '@/hooks/useTimeline'
import { ExtendedHousehold } from '@/types/household'
import { TaskPhase } from '@/types/database'
import TaskCard from '../tasks/TaskCard'
import { HorizontalTimelineView } from '../timeline/HorizontalTimelineView'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PersonalizedChecklistViewProps {
  household: ExtendedHousehold
}

export const PersonalizedChecklistView = ({ household }: PersonalizedChecklistViewProps) => {
  const { tasks, loading, toggleTaskCompletion, createInitialTasks } = useTasks(household.id)
  const { timelineItems } = useTimeline(household.id)
  const [activeView, setActiveView] = useState<'list' | 'timeline' | 'categories'>('categories')

  const getPhaseName = (phase: TaskPhase) => {
    const names = {
      vor_umzug: 'Vor dem Umzug',
      umzugstag: 'Umzugstag', 
      nach_umzug: 'Nach dem Umzug',
      langzeit: 'Langfristig'
    }
    return names[phase] || phase
  }

  const getPhaseProgress = (phase: TaskPhase) => {
    const phaseTasks = tasks.filter(task => task.phase === phase)
    const completedTasks = phaseTasks.filter(task => task.completed)
    return phaseTasks.length > 0 ? Math.round((completedTasks.length / phaseTasks.length) * 100) : 0
  }

  // Kategorisiere Tasks basierend auf Personalisierung
  const categorizedTasks = {
    basis: tasks.filter(task => ['Behörden', 'Verträge', 'Gesundheit'].includes(task.category || '')),
    familie: tasks.filter(task => task.category === 'Familie' || task.category === 'Kinder'),
    haustiere: tasks.filter(task => task.category === 'Haustiere'),
    auto: tasks.filter(task => ['Fahrzeug', 'Transport'].includes(task.category || '')),
    gewerbe: tasks.filter(task => ['Gewerbe', 'Arbeit'].includes(task.category || '')),
    wohnen: tasks.filter(task => ['Miete', 'Eigentum', 'Wohnen', 'Garten'].includes(task.category || ''))
  }

  const overallProgress = tasks.length > 0 
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) 
    : 0

  const urgentTasks = tasks.filter(task => 
    !task.completed && 
    task.due_date && 
    new Date(task.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  )

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTaskCompletion(taskId, completed)
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleCreateInitialTasks = async () => {
    try {
      await createInitialTasks()
    } catch (error) {
      console.error('Error creating initial tasks:', error)
    }
  }

  // Erstelle Personalisierungs-Insights
  const getPersonalizationInsights = () => {
    const insights = []
    
    if (household.children_count > 0) {
      insights.push({
        icon: Baby,
        title: `${household.children_count} Kinder`,
        description: `Spezielle Aufgaben für Familien mit Kindern`,
        taskCount: categorizedTasks.familie.length
      })
    }
    
    if (household.pets_count > 0) {
      insights.push({
        icon: PawPrint,
        title: `${household.pets_count} Haustiere`,
        description: `Haustier-spezifische Ummeldungen und Betreuung`,
        taskCount: categorizedTasks.haustiere.length
      })
    }
    
    if (household.owns_car) {
      insights.push({
        icon: Car,
        title: 'Auto-Besitzer',
        description: `KFZ-Ummeldung und Parkplatz-Organisation`,
        taskCount: categorizedTasks.auto.length
      })
    }
    
    if (household.is_self_employed) {
      insights.push({
        icon: Briefcase,
        title: 'Selbstständig',
        description: `Gewerbe- und steuerrechtliche Ummeldungen`,
        taskCount: categorizedTasks.gewerbe.length
      })
    }
    
    if (household.property_type === 'miete') {
      insights.push({
        icon: Home,
        title: 'Mieter',
        description: `Kaution, Übergabe und Mietrecht`,
        taskCount: categorizedTasks.wohnen.filter(t => ['Miete'].includes(t.category || '')).length
      })
    }
    
    if (household.property_type === 'eigentum') {
      insights.push({
        icon: Building,
        title: 'Eigentümer',
        description: `Grundbuch, Versicherungen und Grundsteuer`,
        taskCount: categorizedTasks.wohnen.filter(t => ['Eigentum'].includes(t.category || '')).length
      })
    }
    
    return insights
  }

  const personalizationInsights = getPersonalizationInsights()

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Lade personalisierte Checkliste...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalisierte Checkliste
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'categories' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('categories')}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('timeline')}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Gesamtfortschritt</span>
            <span>{overallProgress}% ({tasks.filter(t => t.completed).length}/{tasks.length})</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          
          {urgentTasks.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>{urgentTasks.length} dringende Aufgaben</span>
            </div>
          )}
        </div>

        {/* Personalisierung Insights */}
        {personalizationInsights.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {personalizationInsights.map((insight, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <insight.icon className="h-3 w-3" />
                    {insight.title} ({insight.taskCount} Aufgaben)
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="text-center py-8 px-6">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Noch keine personalisierten Aufgaben vorhanden
            </p>
            <Button onClick={handleCreateInitialTasks} className="gap-2">
              <Plus className="h-4 w-4" />
              Personalisierte Checkliste erstellen
            </Button>
          </div>
        ) : (
          <>
            {activeView === 'categories' && (
              <div className="px-6 pb-6">
                <div className="grid gap-4">
                  {/* Basis-Aufgaben */}
                  {categorizedTasks.basis.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <List className="h-5 w-5" />
                          Grundaufgaben für alle
                          <Badge variant="outline">{categorizedTasks.basis.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categorizedTasks.basis.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Familien-Aufgaben */}
                  {categorizedTasks.familie.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Baby className="h-5 w-5" />
                          Für Familien mit Kindern
                          <Badge variant="outline">{categorizedTasks.familie.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categorizedTasks.familie.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Haustier-Aufgaben */}
                  {categorizedTasks.haustiere.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <PawPrint className="h-5 w-5" />
                          Für Haustier-Besitzer
                          <Badge variant="outline">{categorizedTasks.haustiere.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categorizedTasks.haustiere.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Auto-Aufgaben */}
                  {categorizedTasks.auto.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          Für Auto-Besitzer
                          <Badge variant="outline">{categorizedTasks.auto.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categorizedTasks.auto.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Gewerbe-Aufgaben */}
                  {categorizedTasks.gewerbe.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Für Selbstständige
                          <Badge variant="outline">{categorizedTasks.gewerbe.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categorizedTasks.gewerbe.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Wohn-Aufgaben */}
                  {categorizedTasks.wohnen.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {household.property_type === 'eigentum' ? <Building className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                          {household.property_type === 'eigentum' ? 'Für Eigentümer' : 'Für Mieter'}
                          <Badge variant="outline">{categorizedTasks.wohnen.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categorizedTasks.wohnen.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeView === 'list' && (
              <div className="px-6 pb-6">
                <Tabs defaultValue="urgent" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="urgent">Dringend</TabsTrigger>
                    <TabsTrigger value="vor_umzug">Vorbereitung</TabsTrigger>
                    <TabsTrigger value="umzugstag">Umzugstag</TabsTrigger>
                    <TabsTrigger value="nach_umzug">Nachbereitung</TabsTrigger>
                    <TabsTrigger value="langzeit">Langzeit</TabsTrigger>
                  </TabsList>

                  <TabsContent value="urgent" className="space-y-3 mt-4">
                    {urgentTasks.length > 0 ? (
                      urgentTasks.map(task => (
                        <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Keine dringenden Aufgaben
                      </div>
                    )}
                  </TabsContent>

                  {(['vor_umzug', 'umzugstag', 'nach_umzug', 'langzeit'] as TaskPhase[]).map(phase => (
                    <TabsContent key={phase} value={phase} className="space-y-3 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{getPhaseName(phase)}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getPhaseProgress(phase)}%
                          </Badge>
                          <Progress value={getPhaseProgress(phase)} className="w-16 h-2" />
                        </div>
                      </div>
                      {tasks.filter(task => task.phase === phase).map(task => (
                        <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {activeView === 'timeline' && (
              <div className="h-96 overflow-hidden">
                <HorizontalTimelineView household={household} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}