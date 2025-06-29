import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus } from 'lucide-react';
import TaskCard from './tasks/TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { Database, TaskPhase } from '@/types/database';
import { ExtendedHousehold } from '@/types/household';
import { TimelineButton } from './timeline/TimelineButton';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListProps {
  household: ExtendedHousehold;
  onBack: () => void;
}

export const TaskList = ({ household, onBack }: TaskListProps) => {
  const { tasks, loading, toggleTaskCompletion, createInitialTasks } = useTasks(household.id);

  const getPhaseName = (phase: TaskPhase) => {
    const names = {
      vor_umzug: 'Vor dem Umzug',
      umzugstag: 'Umzugstag',
      nach_umzug: 'Nach dem Umzug',
      langzeit: 'Langfristig'
    };
    return names[phase] || phase;
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const filterTasksByPhase = (phase: TaskPhase) => {
    return tasks.filter(task => task.phase === phase);
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTaskCompletion(taskId, completed);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleCreateInitialTasks = async () => {
    try {
      await createInitialTasks();
    } catch (error) {
      console.error('Error creating initial tasks:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Aufgaben werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>
          
          <TimelineButton household={household} />
        </div>

        {/* Household Info */}
        <Card className="bg-white shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{household.name}</CardTitle>
            <CardDescription>
              {household.members?.length || 0} Mitglieder • Umzug am {new Date(household.move_date).toLocaleDateString('de-DE')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Gesamtfortschritt</span>
                  <span>{progressPercent}% ({completedTasks} von {tasks.length} Aufgaben)</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
              
              {tasks.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Noch keine Aufgaben vorhanden</p>
                  <Button onClick={handleCreateInitialTasks} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Grundaufgaben erstellen
                  </Button>
                </div>
              )}
              
              {household.members && household.members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {household.members.map((member, index) => (
                    <Badge key={index} variant="secondary">
                      {member.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        {tasks.length > 0 && (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white">
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="vor_umzug">Vorbereitung</TabsTrigger>
              <TabsTrigger value="umzugstag">Umzugstag</TabsTrigger>
              <TabsTrigger value="nach_umzug">Nachbereitung</TabsTrigger>
              <TabsTrigger value="langzeit">Langfristig</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-6">
                {(['vor_umzug', 'umzugstag', 'nach_umzug', 'langzeit'] as TaskPhase[]).map(phase => {
                  const phaseTasks = filterTasksByPhase(phase);
                  if (phaseTasks.length === 0) return null;
                  
                  return (
                    <div key={phase}>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">
                        {getPhaseName(phase)}
                      </h3>
                        {phaseTasks.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                        ))}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {(['vor_umzug', 'umzugstag', 'nach_umzug', 'langzeit'] as TaskPhase[]).map(phase => (
              <TabsContent key={phase} value={phase}>
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {getPhaseName(phase)}
                  </h2>
                  {filterTasksByPhase(phase).map(task => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                  ))}
                  {filterTasksByPhase(phase).length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <p className="text-gray-500">Keine Aufgaben in dieser Kategorie</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};