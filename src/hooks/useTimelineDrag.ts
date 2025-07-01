
import { useState, useCallback, useEffect } from 'react'
import { addDays } from 'date-fns'

interface TimelineTask {
  id: string
  x: number
  y: number
  width: number
  height: number
  completed: boolean
  [key: string]: any
}

interface UseTimelineDragProps {
  timelineRef: React.RefObject<HTMLDivElement>
  filteredTasks: TimelineTask[]
  setFilteredTasks: React.Dispatch<React.SetStateAction<TimelineTask[]>>
  zoomLevel: number
  timelineStart: Date
  updateTaskDueDate: (taskId: string, newDate: Date) => void
}

export const useTimelineDrag = ({
  timelineRef,
  filteredTasks,
  setFilteredTasks,
  zoomLevel,
  timelineStart,
  updateTaskDueDate
}: UseTimelineDragProps) => {
  const [draggedTask, setDraggedTask] = useState<TimelineTask | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

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
  }, [draggedTask, dragOffset, setFilteredTasks])

  const handleMouseUp = useCallback(() => {
    if (!draggedTask) return

    const task = filteredTasks.find(t => t.id === draggedTask.id)
    if (!task) return

    const daysFromStart = Math.round(task.x / zoomLevel)
    const newDate = addDays(timelineStart, daysFromStart)
    
    updateTaskDueDate(draggedTask.id, newDate)
    setDraggedTask(null)
  }, [draggedTask, filteredTasks, zoomLevel, timelineStart, updateTaskDueDate])

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

  return {
    draggedTask,
    handleMouseDown
  }
}
