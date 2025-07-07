import { Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Database, TaskPriority } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskCardProps {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
}

const priorityColor = {
  kritisch: 'bg-red-100 text-red-800 border-red-200',
  hoch: 'bg-orange-100 text-orange-800 border-orange-200',
  mittel: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  niedrig: 'bg-green-100 text-green-800 border-green-200'
} as Record<TaskPriority, string>

const priorityIcon = {
  kritisch: <AlertCircle className="h-3 w-3" />,
  hoch: <AlertCircle className="h-3 w-3" />,
  mittel: <Clock className="h-3 w-3" />,
  niedrig: <CheckCircle className="h-3 w-3" />
} as Record<TaskPriority, JSX.Element>

export const TaskCard = ({ task, onToggle }: TaskCardProps) => (
  <Card className={`mb-4 transition-all ${task.completed ? 'opacity-60' : ''}`}>
    <CardContent className="pt-4">
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggle(task.id, !!checked)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={priorityColor[task.priority]}>
                {priorityIcon[task.priority]}
                <span className="ml-1 capitalize">{task.priority}</span>
              </Badge>
            </div>
          </div>

          {task.description && <p className="text-sm text-gray-600">{task.description}</p>}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {task.due_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(task.due_date).toLocaleDateString('de-DE')}
                </div>
              )}
              {task.estimated_duration && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {task.estimated_duration} Min
                </div>
              )}
              {task.category && (
                <Badge variant="secondary" className="text-xs">
                  {task.category}
                </Badge>
              )}
            </div>
            {task.assigned_to && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Zugewiesen
              </div>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default TaskCard


