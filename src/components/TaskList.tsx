
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'before' | 'moving' | 'after' | 'legal';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  assignedTo?: string;
  completed: boolean;
  estimatedTime: string;
}

interface Household {
  id: string;
  name: string;
  members: string[];
  progress: number;
  nextDeadline: string;
}

interface TaskListProps {
  household: Household;
  onBack: () => void;
}

export const TaskList = ({ household, onBack }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Mietvertrag kündigen',
      description: 'Kündigungsschreiben für die alte Wohnung aufsetzen und versenden',
      category: 'legal',
      priority: 'high',
      deadline: '2025-01-15',
      assignedTo: 'Max',
      completed: false,
      estimatedTime: '1 Stunde'
    },
    {
      id: '2',
      title: 'Umzugsunternehmen beauftragen',
      description: 'Angebote einholen und Umzugsunternehmen buchen',
      category: 'before',
      priority: 'high',
      deadline: '2025-01-20',
      completed: false,
      estimatedTime: '2 Stunden'
    },
    {
      id: '3',
      title: 'Kartons besorgen',
      description: 'Ausreichend Umzugskartons und Verpackungsmaterial kaufen',
      category: 'before',
      priority: 'medium',
      deadline: '2025-02-01',
      assignedTo: 'Anna',
      completed: true,
      estimatedTime: '30 Minuten'
    },
    {
      id: '4',
      title: 'Adresse bei Banken ändern',
      description: 'Neue Adresse bei allen Banken und Versicherungen hinterlegen',
      category: 'after',
      priority: 'medium',
      deadline: '2025-02-15',
      completed: false,
      estimatedTime: '45 Minuten'
    }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getCategoryName = (category: string) => {
    const names = {
      before: 'Vor dem Umzug',
      moving: 'Umzugstag',
      after: 'Nach dem Umzug',
      legal: 'Rechtliches & Behörden'
    };
    return names[category as keyof typeof names] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors] || '';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle className="h-3 w-3" />;
    if (priority === 'medium') return <Clock className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  const filterTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className={`mb-4 transition-all ${task.completed ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTask(task.id)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {getPriorityIcon(task.priority)}
                  <span className="ml-1 capitalize">{task.priority}</span>
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">{task.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(task.deadline).toLocaleDateString('de-DE')}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {task.estimatedTime}
                </div>
              </div>
              {task.assignedTo && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {task.assignedTo}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
        </div>

        {/* Household Info */}
        <Card className="bg-white shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{household.name}</CardTitle>
            <CardDescription>
              {household.members.length} Mitglieder • Umzug am {new Date(household.nextDeadline).toLocaleDateString('de-DE')}
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
              
              <div className="flex flex-wrap gap-2">
                {household.members.map((member, index) => (
                  <Badge key={index} variant="secondary">
                    {member}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="before">Vorbereitung</TabsTrigger>
            <TabsTrigger value="legal">Rechtliches</TabsTrigger>
            <TabsTrigger value="moving">Umzugstag</TabsTrigger>
            <TabsTrigger value="after">Nachbereitung</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-6">
              {['legal', 'before', 'moving', 'after'].map(category => {
                const categoryTasks = filterTasksByCategory(category);
                if (categoryTasks.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">
                      {getCategoryName(category)}
                    </h3>
                    {categoryTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {['before', 'legal', 'moving', 'after'].map(category => (
            <TabsContent key={category} value={category}>
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {getCategoryName(category)}
                </h2>
                {filterTasksByCategory(category).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {filterTasksByCategory(category).length === 0 && (
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
      </div>
    </div>
  );
};
