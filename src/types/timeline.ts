export interface TimelineItem {
  id: string
  title: string
  description: string
  start: string | null
  phase: string
  priority: string
  category: string
  completed: boolean
  assigned_to: string | null
  assignee_name: string | null
  is_overdue: boolean
  module_color: string
  className: string
}

export interface TimelinePreferences {
  zoom_level: 'week' | 'month'
  snap_to_grid: boolean
  show_modules: string[]
}

export interface TimelineViewOptions {
  start: Date
  end: Date
  zoomLevel: 'week' | 'month'
  showCompleted: boolean
  filterPhase?: string
  filterPriority?: string
  filterCategory?: string
}

export interface VisItem {
  id: string | number
  content: string
  start: Date | string
  end?: Date | string
  type?: "box" | "point" | "range" | string
  className?: string
  data?: Record<string, unknown>
}

export interface TimelineHistoryEntry {
  id: string
  task_id: string
  changed_by: string
  old_due_date: string | null
  new_due_date: string | null
  changed_at: string
}