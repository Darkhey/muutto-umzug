import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import TaskCard from './tasks/TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { Database, TaskPhase } from '@/types/database';
import { ExtendedHousehold } from '@/types/household';
import { TimelineButton } from './timeline/TimelineButton';
import { PersonalizedChecklistView } from './checklist/PersonalizedChecklistView';

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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{household.name}</CardTitle>
                <CardDescription>
                  {household.members?.length || 0} Mitglieder • Umzug am {new Date(household.move_date).toLocaleDateString('de-DE')}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => {/* Show regular list view */}}
              >
                <Sparkles className="h-4 w-4" />
                Personalisiert
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Personalized Checklist View */}
        <PersonalizedChecklistView household={household} />
      </div>
    </div>
  );
};