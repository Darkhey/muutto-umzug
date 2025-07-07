
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  phase: string;
  priority: string;
  category?: string;
  start?: string;
  completed: boolean;
  assigned_to?: string;
  assignee_name?: string;
  is_overdue: boolean;
  module_color: string;
  className?: string;
  comment_count?: number;
  is_sticky?: boolean;
}

export interface VisItem {
  id: string;
  content: string;
  start: number | Date;
  type?: string;
  className?: string;
}

export interface TimelineViewOptions {
  start: Date;
  end: Date;
  zoomLevel: 'week' | 'month';
  showCompleted: boolean;
  filterPhase?: string;
  filterPriority?: string;
  filterCategory?: string;
}
