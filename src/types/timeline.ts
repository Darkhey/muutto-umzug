
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  phase: string;
  priority: string;
  category?: string;
  start?: string;
  due_date?: string | null;
  completed: boolean;
  assigned_to?: string;
  assignee_id?: string | null;
  assignee_name?: string;
  is_overdue: boolean;
  module_color: string;
  className?: string;
  comment_count?: number;
  is_sticky?: boolean;
  link_url?: string | null;
  attachment_url?: string | null;
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

// Zusätzliche Types für Timeline-Funktionalität
export interface TimelineTaskData {
  id: string;
  title: string;
  description?: string;
  start?: string;
  due_date?: string | null;
  completed: boolean;
  priority: string;
  phase: string;
  category?: string;
  module_color: string;
  assignee_name?: string | null;
  is_overdue: boolean;
}

export interface TimelineTaskExtended extends TimelineTaskData {
  assignee_name?: string;
  is_overdue: boolean;
  comment_count?: number;
}
