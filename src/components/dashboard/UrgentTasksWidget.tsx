import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react'
import { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

interface UrgentTasksWidgetProps {
  tasks: Task[]
  onToggleTask: (taskId: string, completed: boolean) => void
  onViewAllTasks: () => void
}

export const UrgentTasksWidget = ({ tasks, onToggleTask, onViewAllTasks }: UrgentTasksWidgetProps) => {
  // Sort tasks by urgency: overdue first, then by due date
  const sortedTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const dateA = a.due_date ? new Date(a.due_date) : new Date('2099-12-31')
      const dateB = b.due_date ? new Date(b.due_date) : new Date('2099-12-31')
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)

  const getUrgencyInfo = (task: Task) => {
    if (!task.due_date) return { color: 'text-muted-foreground', icon: Clock, label: 'Kein Termin' }
    
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { 
        color: 'text-destructive', 
        icon: AlertTriangle, 
        label: `Überfällig seit ${Math.abs(diffDays)} Tag${Math.abs(diffDays) === 1 ? '' : 'en'}`,
        bgColor: 'bg-destructive/10 border-destructive/20'
      }
    } else if (diffDays === 0) {
      return { 
        color: 'text-yellow-600', 
        icon: AlertTriangle, 
        label: 'Heute fällig',
        bgColor: 'bg-yellow-50 border-yellow-200'
      }
    } else if (diffDays <= 3) {
      return { 
        color: 'text-yellow-600', 
        icon: Clock, 
        label: `In ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`,
        bgColor: 'bg-yellow-50 border-yellow-200'
      }
    } else if (diffDays <= 7) {
      return { 
        color: 'text-blue-600', 
        icon: Clock, 
        label: `In ${diffDays} Tagen`,
        bgColor: 'bg-blue-50 border-blue-200'
      }
    } else {
      return { 
        color: 'text-muted-foreground', 
        icon: Calendar, 
        label: dueDate.toLocaleDateString('de-DE'),
        bgColor: 'bg-muted/50 border-border'
      }
    }
  }

  if (sortedTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Dringende Aufgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-600 mb-1">Alles erledigt! 🎉</p>
            <p className="text-sm text-muted-foreground">
              Keine dringenden Aufgaben vorhanden
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Dringende Aufgaben
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllTasks}>
            Alle anzeigen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedTasks.map((task) => {
          const urgencyInfo = getUrgencyInfo(task)
          const IconComponent = urgencyInfo.icon

          return (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-sm ${urgencyInfo.bgColor || 'bg-card border-border'}`}
            >
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-5 w-5 rounded-full border-2 border-border hover:border-primary"
                  onClick={() => onToggleTask(task.id, true)}
                >
                  <CheckCircle className="h-4 w-4 opacity-0 hover:opacity-100 transition-opacity" />
                </Button>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                    {task.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1 ${urgencyInfo.color}`}>
                      <IconComponent className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {urgencyInfo.label}
                      </span>
                    </div>
                    
                    {task.priority && (
                      <Badge 
                        variant={task.priority === 'hoch' ? 'destructive' : task.priority === 'mittel' ? 'default' : 'secondary'} 
                        className="text-xs px-1 py-0"
                      >
                        {task.priority}
                      </Badge>
                    )}
                    
                    {task.phase && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {task.phase === 'vor_umzug' ? 'Vor Umzug' : 
                         task.phase === 'umzugstag' ? 'Umzugstag' : 
                         task.phase === 'nach_umzug' ? 'Nach Umzug' : 
                         task.phase === 'langzeit' ? 'Langfristig' : task.phase}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {tasks.filter(t => !t.completed).length > 3 && (
          <Button variant="outline" className="w-full" onClick={onViewAllTasks}>
            {tasks.filter(t => !t.completed).length - 3} weitere Aufgaben anzeigen
          </Button>
        )}
      </CardContent>
    </Card>
  )
}