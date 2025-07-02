import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, List, Clock, Plus, Users } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useTimeline } from '@/hooks/useTimeline'
import { ExtendedHousehold } from '@/types/household'
import { TaskPhase } from '@/types/database'
import TaskCard from '../tasks/TaskCard'
import { HorizontalTimelineView } from '../timeline/HorizontalTimelineView'

interface ChecklistViewProps {
  household: ExtendedHousehold
}

export const ChecklistView = ({ household }: ChecklistViewProps) => {
  const { tasks, loading, toggleTaskCompletion, createInitialTasks } = useTasks(household.id)
  const { timelineItems } = useTimeline(household.id)
  const [activeView, setActiveView] = useState<'list' | 'timeline' | 'calendar'>('list')

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

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Lade Checkliste...</p>
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
            <List className="h-5 w-5" />
            Checkliste
          </CardTitle>
          <div className="flex gap-2">
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
      </CardHeader>

      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="text-center py-8 px-6">
            <p className="text-muted-foreground mb-4">Noch keine Aufgaben vorhanden</p>
            <Button onClick={handleCreateInitialTasks} className="gap-2">
              <Plus className="h-4 w-4" />
              Grundaufgaben erstellen
            </Button>
          </div>
        ) : (
          <>
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