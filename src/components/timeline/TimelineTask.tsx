
import { Badge } from '@/components/ui/badge'
import { Grip } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface TimelineTaskData {
  id: string
  title: string
  assignee_name: string | null
  phase: string
  start: string | null
  completed: boolean
  is_overdue: boolean
  priority: string
  x: number
  y: number
  width: number
  height: number
}

interface TimelineTaskProps {
  task: TimelineTaskData
  isDragged: boolean
  colors: Record<string, string>
  phaseColors: Record<string, string>
  onMouseDown: (e: React.MouseEvent, task: TimelineTaskData) => void
  onDoubleClick: (task: TimelineTaskData) => void
}

export const TimelineTask = ({
  task,
  isDragged,
  colors,
  phaseColors,
  onMouseDown,
  onDoubleClick
}: TimelineTaskProps) => {
  const getTaskColor = () => {
    if (task.completed) return colors.completed
    if (task.is_overdue) return '#ef4444'
    return colors[task.priority as keyof typeof colors] || phaseColors[task.phase as keyof typeof phaseColors]
  }

  return (
    <div
      className={`absolute rounded-lg shadow-md cursor-move transition-all duration-200 ${
        isDragged ? 'z-50 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'
      } ${task.completed ? 'opacity-60' : ''}`}
      style={{
        left: task.x,
        top: task.y,
        width: task.width,
        height: task.height,
        backgroundColor: getTaskColor()
      }}
      onMouseDown={(e) => onMouseDown(e, task)}
      onDoubleClick={() => onDoubleClick(task)}
    >
      <div className="p-2 h-full flex flex-col justify-between text-white text-xs">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-1">
            <div className="font-semibold truncate">{task.title}</div>
            {task.assignee_name && (
              <div className="text-xs opacity-80 truncate">{task.assignee_name}</div>
            )}
          </div>
          <Grip className="h-3 w-3 opacity-60 flex-shrink-0" />
        </div>
        
        <div className="flex justify-between items-end">
          <Badge 
            variant="secondary" 
            className="px-1 py-0 text-xs bg-white/20 text-white border-white/30"
          >
            {task.phase}
          </Badge>
          {task.start && (
            <div className="text-xs opacity-80">
              {format(new Date(task.start), 'dd.MM', { locale: de })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
