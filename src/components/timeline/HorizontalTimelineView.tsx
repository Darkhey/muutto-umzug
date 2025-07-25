
import { useState, useEffect, useRef, useCallback } from 'react'
import { CardContent } from '@/components/ui/card'
import { useTimeline } from '@/hooks/useTimeline'
import { TimelineItem } from '@/types/timeline'
import { ExtendedHousehold } from '@/types/household'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'
import { TimelineControls } from './TimelineControls'
import { TimelineGrid } from './TimelineGrid'
import { TimelineTask } from './TimelineTask'
import { TimelineStats } from './TimelineStats'
import { TimelineLegend } from './TimelineLegend'
import { useTimelineDrag } from '@/hooks/useTimelineDrag'
import { useTimelineExport } from '@/hooks/useTimelineExport'
import { addDays, subDays } from 'date-fns'
import { supabase } from '@/integrations/supabase/client'

import { AISuggestionsDialog } from './AISuggestionsDialog';

interface HorizontalTimelineViewProps {
  household: ExtendedHousehold
  onBack?: () => void
}

interface TimelineTaskExtended extends TimelineItem {
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
  const { timelineItems, loading, updateTaskDueDate, updateTask, addTask } = useTimeline(household.id)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(30)
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TimelineItem | null>(null)
  const [timelineStart, setTimelineStart] = useState(new Date())
  const [timelineEnd, setTimelineEnd] = useState(new Date())
  const [filteredTasks, setFilteredTasks] = useState<TimelineTaskExtended[]>([])

  const [aiSuggestions, setAiSuggestions] = useState<TimelineItem[]>([]);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);

  const handleCreateStickyNote = async () => {
    if (!household.id) return;
    await addTask({
      title: 'Neue Sticky Note',
      description: '',
      phase: 'langzeit',
      priority: 'niedrig',
      due_date: null,
      is_sticky: true,
      module_color: 'orange',
    });
  };

  const handleGenerateAISuggestions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-timeline-suggestions', {
        body: { householdId: household.id },
      });

      if (error) throw error;

      setAiSuggestions(data.suggestions);
      setShowSuggestionsDialog(true);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  };

  const { exportToICal } = useTimelineExport(timelineItems, household.name)

  // Convert timeline items to positioned tasks
  const convertToTimelineTasks = useCallback((items: TimelineItem[]): TimelineTaskExtended[] => {
    const daysDiff = (date1: Date, date2: Date) => {
      const diffTime = date1.getTime() - date2.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const filtered = items.filter(item => showCompleted || !item.completed)
    
    return filtered.map((item, index) => {
      const taskDate = item.start ? new Date(item.start) : new Date(household.move_date)
      const daysFromStart = daysDiff(taskDate, timelineStart)
      const x = Math.max(0, daysFromStart * zoomLevel)
      const width = Math.max(120, item.title.length * 8)
      const y = (index % 4) * 80 + 20
      
      return {
        ...item,
        x,
        width,
        y,
        height: 60
      } as TimelineTaskExtended
    })
  }, [showCompleted, zoomLevel, timelineStart, household.move_date])

  useEffect(() => {
    setFilteredTasks(convertToTimelineTasks(timelineItems))
  }, [timelineItems, convertToTimelineTasks])

  // Determine timeline range based on tasks
  useEffect(() => {
    if (timelineItems.length === 0) {
      const move = new Date(household.move_date)
      setTimelineStart(subDays(move, 30))
      setTimelineEnd(addDays(move, 30))
      return
    }

    const dates = timelineItems
      .filter(item => item.start)
      .map(item => new Date(item.start!))

    const earliest = dates.length
      ? new Date(Math.min(...dates.map(d => d.getTime())))
      : new Date(household.move_date)

    const latest = dates.length
      ? new Date(Math.max(...dates.map(d => d.getTime())))
      : new Date(household.move_date)

    setTimelineStart(subDays(earliest, 10))
    setTimelineEnd(addDays(latest, 10))
  }, [timelineItems, household.move_date])

  const { draggedTask, handlePointerDown } = useTimelineDrag({
    timelineRef,
    filteredTasks,
    setFilteredTasks,
    zoomLevel,
    timelineStart,
    updateTaskDueDate
  })

  const handleTaskDoubleClick = (task: TimelineTaskExtended) => {
    setSelectedTask(task)
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
    <>
      <div className="space-y-4">
        <TimelineControls
          household={household}
          zoomLevel={zoomLevel}
          showCompleted={showCompleted}
          onZoomIn={() => setZoomLevel(prev => Math.min(100, prev + 10))}
          onZoomOut={() => setZoomLevel(prev => Math.max(10, prev - 10))}
          onToggleCompleted={setShowCompleted}
          onExportToICal={exportToICal}
          onGenerateAISuggestions={handleGenerateAISuggestions}
          onCreateStickyNote={handleCreateStickyNote}
        />
        
        <CardContent>
          <div className="relative border rounded-lg bg-white overflow-x-auto overflow-y-visible" style={{ height: '400px' }}>
            <div 
              ref={timelineRef}
              className="relative bg-gradient-to-r from-blue-50 via-white to-purple-50"
              style={{ width: totalWidth + 100, height: '100%' }}
            >
              <TimelineGrid 
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                zoomLevel={zoomLevel}
                moveDate={household.move_date}
              />
              
              {filteredTasks.map((task) => (
                <TimelineTask
                  key={task.id}
                  task={{
                    ...task,
                    start: task.start || task.due_date || '',
                    description: task.description || '',
                    assignee_name: task.assignee_name || null,
                    module_color: task.module_color || 'blue'
                  }}
                  isDragged={draggedTask?.id === task.id}
                  colors={COLORS}
                  phaseColors={PHASE_COLORS}
                  onPointerDown={handlePointerDown}
                  onDoubleClick={handleTaskDoubleClick}
                  onUpdateTask={(task, newTitle) => updateTask(task.id, { title: newTitle })}
                />
              ))}
            </div>
          </div>
          
          <TimelineLegend colors={COLORS} />
        </CardContent>
        
        <TimelineStats timelineItems={timelineItems} />
      </div>
      
      <EditTaskDialog
        open={selectedTask !== null}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        householdId={household.id}
        task={selectedTask}
      />

      <AISuggestionsDialog
        open={showSuggestionsDialog}
        onOpenChange={setShowSuggestionsDialog}
        suggestions={aiSuggestions}
        onAccept={(suggestion) => {
          addTask({ ...suggestion, module_color: 'blue' });
          setShowSuggestionsDialog(false);
        }}
      />
    </>
  )
}
