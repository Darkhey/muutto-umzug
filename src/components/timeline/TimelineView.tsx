import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useTimeline } from '@/hooks/useTimeline'
import { useTasks } from '@/hooks/useTasks'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { TimelineItem, TimelineViewOptions, VisItem } from '@/types/timeline'
import { ExtendedHousehold } from '@/types/household'
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Calendar as CalendarIcon, 
  List, 
  CheckCircle, 
  Clock,
  Undo2,
  Plus,
  MoveHorizontal,
  Filter,
  X,
  Grip
} from 'lucide-react'
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventClickArg } from '@fullcalendar/core'
import { DateClickArg } from '@fullcalendar/interaction'

// Import vis-timeline
import { Timeline, DataSet } from 'vis-timeline/standalone'
import 'vis-timeline/styles/vis-timeline-graph2d.css'

interface TimelineViewProps {
  household: ExtendedHousehold;
  onBack?: () => void;
}



export const TimelineView = ({ household, onBack }: TimelineViewProps) => {
  const { toast } = useToast()
  const { 
    timelineItems, 
    preferences, 
    loading, 
    updateTaskDueDate, 
    updatePreferences 
  } = useTimeline(household.id)
  const { createTask } = useTasks(household.id)
  
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
  const [viewOptions, setViewOptions] = useState<TimelineViewOptions>({
    start: subDays(new Date(), 30),
    end: addDays(new Date(household.move_date), 30),
    zoomLevel: preferences.zoom_level,
    showCompleted: false
  })
  
  const [filteredItems, setFilteredItems] = useState<TimelineItem[]>([])
  const [draggedItem, setDraggedItem] = useState<TimelineItem | null>(null)
  const [undoStack, setUndoStack] = useState<{taskId: string, oldDate: string | null}[]>([])
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const timelineInstanceRef = useRef<Timeline | null>(null)
  const calendarRef = useRef<FullCalendar>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter timeline items based on view options
  useEffect(() => {
    if (!timelineItems) return
    
    let filtered = [...timelineItems]
    
    // Filter by completion status
    if (!viewOptions.showCompleted) {
      filtered = filtered.filter(item => !item.completed)
    }
    
    // Filter by phase if specified
    if (viewOptions.filterPhase) {
      filtered = filtered.filter(item => item.phase === viewOptions.filterPhase)
    }
    
    // Filter by priority if specified
    if (viewOptions.filterPriority) {
      filtered = filtered.filter(item => item.priority === viewOptions.filterPriority)
    }
    
    // Filter by category if specified
    if (viewOptions.filterCategory) {
      filtered = filtered.filter(item => item.category === viewOptions.filterCategory)
    }
    
    setFilteredItems(filtered)
  }, [timelineItems, viewOptions])

  // Initialize timeline
  useEffect(() => {
    if (!timelineContainerRef.current || loading || filteredItems.length === 0) return
    
    // Prepare data for vis-timeline
    const items = new DataSet(
      filteredItems.map(item => {
        const dateText = item.start ? format(new Date(item.start), 'dd.MM') : ''
        return {
          id: String(item.id), // Ensure ID is string
          content: `
          <div class="timeline-item ${item.is_overdue ? 'overdue' : ''} ${item.completed ? 'completed' : ''} priority-${item.priority}">
            <div class="timeline-item-header" style="background-color: var(--${item.module_color}-100);">
              <span class="timeline-item-title">${item.title}</span>
              ${item.assignee_name ? `<span class="timeline-item-assignee">${item.assignee_name}</span>` : ''}
            </div>
            <div class="timeline-item-body">
              ${item.description ? `<p class="timeline-item-desc">${item.description}</p>` : ''}
              <div class="timeline-item-meta">
                <span class="timeline-item-phase">${item.phase}</span>
                <span class="timeline-item-priority">${item.priority}</span>
                ${dateText ? `<span class="timeline-item-date">${dateText}</span>` : ''}
              </div>
            </div>
          </div>
        `,
          start: item.start || undefined,
          type: 'box',
          className: item.className
        }
      })
    )
    
    // Configure timeline options
    const options = {
      zoomable: true,
      moveable: true,
      orientation: 'top',
      min: viewOptions.start,
      max: viewOptions.end,
      zoomMin: 1000 * 60 * 60 * 24 * 7, // One week
      zoomMax: 1000 * 60 * 60 * 24 * 365, // One year
      snap: preferences.snap_to_grid ? (date: Date) => {
        date.setHours(0, 0, 0, 0)
        return date
      } : null,
      onMove: (item: any, callback: (item?: any) => void) => {
        // Store the old date for undo functionality
        const oldItem = filteredItems.find(i => i.id === String(item.id))
        if (oldItem) {
          setUndoStack(prev => [...prev, { taskId: oldItem.id, oldDate: oldItem.start }])
        }
        
        // Update the task due date
        const newDate = new Date(item.start)
        updateTaskDueDate(String(item.id), newDate)
        callback(item) // confirm the change
      }
    }
    
    // Create timeline instance
    if (!timelineInstanceRef.current) {
      timelineInstanceRef.current = new Timeline(
        timelineContainerRef.current,
        items,
        options
      )
      
      // Set initial window to include move date
      const moveDate = new Date(household.move_date)
      timelineInstanceRef.current.setWindow(
        subDays(moveDate, 30),
        addDays(moveDate, 30)
      )
      
      // Add event listeners
      timelineInstanceRef.current.on('click', (properties: { item: string }) => {
        if (properties.item) {
          const item = filteredItems.find(i => i.id === properties.item)
          if (item) {
            toast({
              title: item.title,
              description: item.description || 'Keine Beschreibung vorhanden'
            })
          }
        }
      })
    } else {
      // Update existing timeline
      timelineInstanceRef.current.setItems(items)
      timelineInstanceRef.current.setOptions(options)
    }
    
    // Cleanup
    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy()
        timelineInstanceRef.current = null
      }
    }
  }, [filteredItems, loading, preferences.snap_to_grid, viewOptions.start, viewOptions.end, household.move_date, updateTaskDueDate, setUndoStack, toast])

  // Handle drag end for backlog items
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const taskId = active.id as string
    const task = timelineItems.find(item => item.id === taskId)
    
    if (!task) return
    
    // Calculate the date based on drop position
    const dropDate = new Date()
    
    // Store the old date for undo functionality
    setUndoStack(prev => [...prev, { taskId, oldDate: task.start }])
    
    // Update the task due date
    updateTaskDueDate(taskId, dropDate)
    
    setDraggedItem(null)
  }

  // Handle calendar event click
  const handleEventClick = (arg: EventClickArg) => {
    const taskId = arg.event.id
    const task = timelineItems.find(item => item.id === taskId)

    if (task) {
      toast({
        title: task.title,
        description: [
          task.description || 'Keine Beschreibung vorhanden',
          task.start
            ? `Fällig am ${format(new Date(task.start), 'dd.MM.yyyy')}`
            : null
        ]
          .filter(Boolean)
          .join('\n')
      })
    }
  }

  // Handle calendar date click
  const handleDateClick = (arg: DateClickArg) => {
    setNewTaskDate(arg.date)
    setTaskDialogOpen(true)
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.moveTo(arg.date)
    }
  }

  const handleAddAppointment = () => {
    const today = new Date()
    setNewTaskDate(today)
    setTaskDialogOpen(true)
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.moveTo(today)
    }
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(today)
    }
  }

  const handleCreateTask = async (title: string) => {
    if (!newTaskDate) return
    try {
      await createTask({
        title,
        phase: 'vor_umzug',
        priority: 'mittel',
        due_date: format(newTaskDate, 'yyyy-MM-dd')
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Aufgabe konnte nicht erstellt werden',
        variant: 'destructive'
      })
    }
  }

  // Handle undo last change
  const handleUndo = () => {
    if (undoStack.length === 0) return
    
    const lastChange = undoStack[undoStack.length - 1]
    updateTaskDueDate(lastChange.taskId, lastChange.oldDate ? new Date(lastChange.oldDate) : null)
    
    setUndoStack(prev => prev.slice(0, -1))
  }

  // Get backlog items (tasks without due date)
  const backlogItems = useMemo(() => {
    return timelineItems.filter(item => !item.start && !item.completed)
  }, [timelineItems])

  // Format calendar events
  const calendarEvents = useMemo(() => {
    return filteredItems
      .filter(item => item.start)
      .map(item => ({
        id: item.id,
        title: item.title,
        start: item.start,
        allDay: true,
        backgroundColor: item.is_overdue ? '#ef4444' : 
                         item.completed ? '#10b981' : 
                         item.priority === 'kritisch' ? '#f97316' :
                         item.priority === 'hoch' ? '#f59e0b' :
                         item.priority === 'mittel' ? '#3b82f6' : '#6b7280',
        borderColor: item.is_overdue ? '#b91c1c' : 
                     item.completed ? '#059669' : 
                     item.priority === 'kritisch' ? '#ea580c' :
                     item.priority === 'hoch' ? '#d97706' :
                     item.priority === 'mittel' ? '#2563eb' : '#4b5563',
        textColor: '#ffffff',
        classNames: [
          item.is_overdue ? 'overdue' : '',
          item.completed ? 'completed' : '',
          `priority-${item.priority}`
        ]
      }))
  }, [filteredItems])

  // Handle zoom in/out
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.zoomIn(0.5)
    }
  }

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.zoomOut(0.5)
    }
  }

  // Handle today button
  const handleGoToToday = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.moveTo(new Date())
    }
    
    if (calendarRef.current) {
      calendarRef.current.getApi().today()
    }
  }

  // Handle move date button
  const handleGoToMoveDate = () => {
    const moveDate = new Date(household.move_date)
    
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.moveTo(moveDate)
    }
    
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(moveDate)
    }
  }

  // Handle zoom level change
  const handleZoomLevelChange = (level: 'week' | 'month') => {
    setViewOptions(prev => ({ ...prev, zoomLevel: level }))
    updatePreferences({ zoom_level: level })
    
    if (timelineInstanceRef.current) {
      if (level === 'week') {
        const today = new Date()
        timelineInstanceRef.current.setWindow(
          startOfWeek(today, { weekStartsOn: 1 }),
          endOfWeek(today, { weekStartsOn: 1 })
        )
      } else {
        const today = new Date()
        timelineInstanceRef.current.setWindow(
          startOfMonth(today),
          endOfMonth(today)
        )
      }
    }
  }

  // Handle snap to grid toggle
  const handleSnapToggle = (checked: boolean) => {
    updatePreferences({ snap_to_grid: checked })
  }

  // Handle show completed toggle
  const handleShowCompletedToggle = (checked: boolean) => {
    setViewOptions(prev => ({ ...prev, showCompleted: checked }))
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Zeitachse wird geladen...</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Zeitachse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Zeitachse: {household.name}</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Umzugsplanung
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  Umzug: {format(new Date(household.move_date), 'dd.MM.yyyy')}
                </Badge>
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'timeline' | 'calendar')}>
                  <TabsList className="grid w-[180px] grid-cols-2">
                    <TabsTrigger value="timeline">
                      <MoveHorizontal className="h-4 w-4 mr-2" />
                      Zeitachse
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Kalender
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Timeline Controls */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleGoToToday}>
                  <Clock className="h-4 w-4 mr-1" />
                  Heute
                </Button>
                <Button variant="outline" size="sm" onClick={handleGoToMoveDate}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Umzugstag
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddAppointment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Termin hinzufügen
                </Button>
                {undoStack.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleUndo}>
                    <Undo2 className="h-4 w-4 mr-1" />
                    Rückgängig
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="zoom-level" className="text-sm">Ansicht:</Label>
                  <Select 
                    value={viewOptions.zoomLevel} 
                    onValueChange={(v) => handleZoomLevelChange(v as 'week' | 'month')}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Zoom Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Woche</SelectItem>
                      <SelectItem value="month">Monat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="snap-grid" 
                    checked={preferences.snap_to_grid}
                    onCheckedChange={handleSnapToggle}
                  />
                  <Label htmlFor="snap-grid" className="text-sm">Snap to Grid</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="show-completed" 
                    checked={viewOptions.showCompleted}
                    onCheckedChange={handleShowCompletedToggle}
                  />
                  <Label htmlFor="show-completed" className="text-sm">Erledigte anzeigen</Label>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge 
                variant={!viewOptions.filterPhase ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPhase: undefined }))}
              >
                <Filter className="h-3 w-3 mr-1" />
                Alle Phasen
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPhase === 'vor_umzug' ? "default" : "outline"}
                className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPhase: 'vor_umzug' }))}
              >
                Vor dem Umzug
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPhase === 'umzugstag' ? "default" : "outline"}
                className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPhase: 'umzugstag' }))}
              >
                Umzugstag
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPhase === 'nach_umzug' ? "default" : "outline"}
                className="cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPhase: 'nach_umzug' }))}
              >
                Nach dem Umzug
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPhase === 'langzeit' ? "default" : "outline"}
                className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPhase: 'langzeit' }))}
              >
                Langfristig
              </Badge>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Badge 
                variant={!viewOptions.filterPriority ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPriority: undefined }))}
              >
                Alle Prioritäten
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPriority === 'kritisch' ? "default" : "outline"}
                className="cursor-pointer bg-red-100 text-red-800 hover:bg-red-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPriority: 'kritisch' }))}
              >
                Kritisch
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPriority === 'hoch' ? "default" : "outline"}
                className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPriority: 'hoch' }))}
              >
                Hoch
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPriority === 'mittel' ? "default" : "outline"}
                className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPriority: 'mittel' }))}
              >
                Mittel
              </Badge>
              
              <Badge 
                variant={viewOptions.filterPriority === 'niedrig' ? "default" : "outline"}
                className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => setViewOptions(prev => ({ ...prev, filterPriority: 'niedrig' }))}
              >
                Niedrig
              </Badge>
              
              {viewOptions.filterPhase || viewOptions.filterPriority || viewOptions.filterCategory ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={() => setViewOptions(prev => ({ 
                    ...prev, 
                    filterPhase: undefined, 
                    filterPriority: undefined,
                    filterCategory: undefined
                  }))}
                >
                  <X className="h-3 w-3 mr-1" />
                  Filter zurücksetzen
                </Button>
              ) : null}
            </div>
            
            {/* Backlog Items (Tasks without due date) */}
            {backlogItems.length > 0 && (
              <DndContext 
                sensors={sensors} 
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
              >
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <List className="h-4 w-4 mr-2" />
                      Backlog ({backlogItems.length})
                    </h3>
                    <Badge variant="outline" className="bg-gray-100">
                      Ziehen, um Datum zuzuweisen
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {backlogItems.map(item => (
                      <div
                        key={item.id}
                        className={`
                          flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm
                          ${item.priority === 'kritisch' ? 'bg-red-50 border-red-200 text-red-800' : 
                            item.priority === 'hoch' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                            item.priority === 'mittel' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                            'bg-green-50 border-green-200 text-green-800'}
                        `}
                        draggable
                        onDragStart={() => setDraggedItem(item)}
                      >
                        <Grip className="h-3 w-3 cursor-grab" />
                        <span>{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </DndContext>
            )}
            
            {/* Main View (Timeline or Calendar) */}
            <div className="border rounded-lg bg-white overflow-hidden">
              {viewMode === 'timeline' ? (
                <div 
                  ref={timelineContainerRef} 
                  className="h-[500px] w-full timeline-container"
                />
              ) : (
                <div className="h-[500px] w-full">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={viewOptions.zoomLevel === 'week' ? 'timeGridWeek' : 'dayGridMonth'}
                    headerToolbar={false}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    height="100%"
                    locale="de"
                    firstDay={1}
                    nowIndicator
                    dayMaxEvents={3}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: false
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Kritisch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-600">Hoch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-600">Mittel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Niedrig</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 border border-dashed border-red-500"></div>
                <span className="text-xs text-gray-600">Überfällig</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 border border-green-500"></div>
                <span className="text-xs text-gray-600">Erledigt</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Zeitraum</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(household.move_date), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  Umzugstag
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Aufgaben</h3>
                    <p className="text-sm text-gray-600">
                      {timelineItems.filter(item => item.completed).length} / {timelineItems.length} erledigt
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-800">
                  {Math.round((timelineItems.filter(item => item.completed).length / timelineItems.length) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Überfällig</h3>
                    <p className="text-sm text-gray-600">
                      {timelineItems.filter(item => item.is_overdue && !item.completed).length} Aufgaben
                    </p>
                  </div>
                </div>
                <Badge variant={timelineItems.some(item => item.is_overdue && !item.completed) ? "destructive" : "outline"} className="bg-red-50 text-red-800">
                  {timelineItems.some(item => item.is_overdue && !item.completed) ? "Achtung" : "Keine"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {newTaskDate && (
        <CreateTaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          date={newTaskDate}
          onCreate={handleCreateTask}
        />
      )}

      {/* Custom CSS for timeline */}
      <style>{`
        .timeline-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .vis-timeline {
          border: none;
          font-family: inherit;
        }
        
        .vis-item {
          border-color: #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        
        .vis-item.vis-selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .vis-item.overdue {
          border-color: #ef4444;
          border-width: 2px;
        }
        
        .vis-item.completed {
          opacity: 0.7;
        }
        
        .timeline-item {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-size: 0.875rem;
        }
        
        .timeline-item-header {
          padding: 0.25rem 0.5rem;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .timeline-item-body {
          padding: 0.25rem 0.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .timeline-item-desc {
          font-size: 0.75rem;
          color: #4b5563;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .timeline-item-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #6b7280;
        }

        .timeline-item-date {
          margin-left: auto;
        }
        
        .timeline-item-assignee {
          font-size: 0.7rem;
          color: #4b5563;
          max-width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .timeline-item.priority-kritisch .timeline-item-header {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .timeline-item.priority-hoch .timeline-item-header {
          background-color: #ffedd5;
          color: #c2410c;
        }
        
        .timeline-item.priority-mittel .timeline-item-header {
          background-color: #fef9c3;
          color: #854d0e;
        }
        
        .timeline-item.priority-niedrig .timeline-item-header {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .fc-event {
          cursor: pointer;
        }
        
        .fc-event.overdue {
          border-width: 2px;
        }
        
        .fc-event.completed {
          opacity: 0.7;
        }
        
        .fc-day-today {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  )
}
