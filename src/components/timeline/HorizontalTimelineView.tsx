
import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTimeline } from '@/hooks/useTimeline'
import { TimelineItem } from '@/types/timeline'
import { ExtendedHousehold } from '@/types/household'
import { 
  Calendar, 
  Download,
  ZoomIn, 
  ZoomOut, 
  Clock,
  Grip
} from 'lucide-react'
import { format, addDays, subDays, startOfMonth, endOfMonth, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

interface HorizontalTimelineViewProps {
  household: ExtendedHousehold
  onBack?: () => void
}

interface TimelineTask extends TimelineItem {
  x: number
  width: number
  y: number
  height: number
}

const COLORS = {
  kritisch: '#ef4444',
  hoch: '#f97316', 
  mittel: '#3b82f6',
  niedrig: '#10b981',
  completed: '#6b7280'
}

const PHASE_COLORS = {
  vor_umzug: '#3b82f6',
  umzugstag: '#10b981',
  nach_umzug: '#8b5cf6',
  langzeit: '#f97316'
}

export const HorizontalTimelineView = ({ household, onBack }: HorizontalTimelineViewProps) => {
  const { toast } = useToast()
  const { timelineItems, loading, updateTaskDueDate, preferences, updatePreferences } = useTimeline(household.id)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(30) // pixels per day
  const [showCompleted, setShowCompleted] = useState(false)
  const [draggedTask, setDraggedTask] = useState<TimelineTask | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [timelineStart] = useState(subDays(new Date(household.move_date), 60))
  const [timelineEnd] = useState(addDays(new Date(household.move_date), 60))
  const [filteredTasks, setFilteredTasks] = useState<TimelineTask[]>([])

  // Convert timeline items to positioned tasks
  const convertToTimelineTasks = useCallback((items: TimelineItem[]): TimelineTask[] => {
    const daysDiff = (date1: Date, date2: Date) => {
      const diffTime = date1.getTime() - date2.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    let filtered = items.filter(item => showCompleted || !item.completed)
    
    return filtered.map((item, index) => {
      const taskDate = item.start ? new Date(item.start) : new Date(household.move_date)
      const daysFromStart = daysDiff(taskDate, timelineStart)
      const x = Math.max(0, daysFromStart * zoomLevel)
      const width = Math.max(120, item.title.length * 8)
      const y = (index % 4) * 80 + 20 // Stack tasks in 4 rows
      
      return {
        ...item,
        x,
        width,
        y,
        height: 60
      } as TimelineTask
    })
  }, [timelineItems, showCompleted, zoomLevel, timelineStart, household.move_date])

  useEffect(() => {
    setFilteredTasks(convertToTimelineTasks(timelineItems))
  }, [timelineItems, convertToTimelineTasks])

  // Export to iCal
  const exportToICal = () => {
    const icalEvents = timelineItems
      .filter(item => item.start && !item.completed)
      .map(item => {
        const startDate = new Date(item.start!)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
        
        return [
          'BEGIN:VEVENT',
          `UID:${item.id}@muutto.app`,
          `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `SUMMARY:${item.title}`,
          `DESCRIPTION:${item.description || ''}`,
          `CATEGORIES:${item.phase}`,
          `PRIORITY:${item.priority === 'kritisch' ? '1' : item.priority === 'hoch' ? '3' : '5'}`,
          'END:VEVENT'
        ].join('\r\n')
      })

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//muutto//Umzugsplaner//DE',
      'CALSCALE:GREGORIAN',
      ...icalEvents,
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `umzug-${household.name}-${format(new Date(), 'yyyy-MM-dd')}.ics`
    link.click()
    
    toast({
      title: 'iCal Export',
      description: 'Kalender wurde erfolgreich exportiert!'
    })
  }

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, task: TimelineTask) => {
    if (task.completed) return
    
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return

    setDraggedTask(task)
    setDragOffset({
      x: e.clientX - rect.left - task.x,
      y: e.clientY - rect.top - task.y
    })
    
    e.preventDefault()
  }

  // Handle drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedTask || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    setFilteredTasks(prev => 
      prev.map(task => 
        task.id === draggedTask.id 
          ? { ...task, x: Math.max(0, newX), y: Math.max(0, newY) }
          : task
      )
    )
  }, [draggedTask, dragOffset])

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (!draggedTask) return

    const task = filteredTasks.find(t => t.id === draggedTask.id)
    if (!task) return

    // Calculate new date based on position
    const daysFromStart = Math.round(task.x / zoomLevel)
    const newDate = addDays(timelineStart, daysFromStart)
    
    updateTaskDueDate(draggedTask.id, newDate)
    setDraggedTask(null)
  }, [draggedTask, filteredTasks, zoomLevel, timelineStart, updateTaskDueDate])

  // Set up drag event listeners
  useEffect(() => {
    if (draggedTask) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedTask, handleMouseMove, handleMouseUp])

  // Generate timeline grid
  const generateTimelineGrid = () => {
    const days = []
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(timelineStart, i)
      const x = i * zoomLevel
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
      const isMoveDay = format(currentDate, 'yyyy-MM-dd') === household.move_date
      const isCurrentDay = isToday(currentDate)
      const isFirstOfMonth = currentDate.getDate() === 1

      days.push(
        <div
          key={i}
          className={`absolute top-0 w-px h-full border-l ${
            isWeekend ? 'border-gray-200' : 'border-gray-100'
          } ${isMoveDay ? '!border-red-500 !border-l-2' : ''} ${
            isCurrentDay ? '!border-blue-500 !border-l-2' : ''
          }`}
          style={{ left: x }}
        >
          {isFirstOfMonth && (
            <div className="absolute -top-10 -left-8 text-xs font-semibold text-gray-700 whitespace-nowrap">
              {format(currentDate, 'MMM yyyy', { locale: de })}
            </div>
          )}
          {i % 7 === 0 && (
            <div className="absolute -top-6 -left-8 text-xs text-gray-500 whitespace-nowrap">
              {format(currentDate, 'dd.MM', { locale: de })}
            </div>
          )}
          {isMoveDay && (
            <div className="absolute -top-12 -left-16 text-xs font-bold text-red-600 whitespace-nowrap">
              Umzugstag {format(currentDate, 'dd.MM.yyyy', { locale: de })}
            </div>
          )}
          {isCurrentDay && (
            <div className="absolute -top-12 -left-12 text-xs font-bold text-blue-600 whitespace-nowrap">
              Heute {format(currentDate, 'dd.MM', { locale: de })}
            </div>
          )}
        </div>
      )
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Lade Zeitachse...</p>
        </div>
      </div>
    )
  }

  const totalWidth = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)) * zoomLevel

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Umzugs-Timeline: {household.name}
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={exportToICal}>
                <Download className="h-4 w-4 mr-2" />
                iCal Export
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(10, prev - 10))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">{zoomLevel}px/Tag</span>
                <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(100, prev + 10))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="show-completed" 
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                />
                <Label htmlFor="show-completed" className="text-sm">Erledigte anzeigen</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Timeline Container */}
          <div className="relative border rounded-lg bg-white overflow-x-auto" style={{ height: '400px' }}>
            <div 
              ref={timelineRef}
              className="relative bg-gradient-to-r from-blue-50 via-white to-purple-50"
              style={{ width: totalWidth + 100, height: '100%' }}
            >
              {/* Grid */}
              {generateTimelineGrid()}
              
              {/* Tasks */}
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`absolute rounded-lg shadow-md cursor-move transition-all duration-200 ${
                    draggedTask?.id === task.id ? 'z-50 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'
                  } ${task.completed ? 'opacity-60' : ''}`}
                  style={{
                    left: task.x,
                    top: task.y,
                    width: task.width,
                    height: task.height,
                    backgroundColor: task.completed 
                      ? COLORS.completed 
                      : task.is_overdue 
                        ? '#ef4444'
                        : COLORS[task.priority as keyof typeof COLORS] || PHASE_COLORS[task.phase as keyof typeof PHASE_COLORS]
                  }}
                  onMouseDown={(e) => handleMouseDown(e, task)}
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
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.kritisch }}></div>
              <span>Kritisch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.hoch }}></div>
              <span>Hoch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.mittel }}></div>
              <span>Mittel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.niedrig }}></div>
              <span>Niedrig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.completed }}></div>
              <span>Erledigt</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Gesamt Aufgaben</h3>
                <p className="text-2xl font-bold text-blue-600">{timelineItems.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Erledigt</h3>
                <p className="text-2xl font-bold text-green-600">
                  {timelineItems.filter(item => item.completed).length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {Math.round((timelineItems.filter(item => item.completed).length / timelineItems.length) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Überfällig</h3>
                <p className="text-2xl font-bold text-red-600">
                  {timelineItems.filter(item => item.is_overdue && !item.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
