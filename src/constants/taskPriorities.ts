
export const TASK_PRIORITY_MAP = {
  niedrig: 'low',
  mittel: 'medium', 
  hoch: 'high',
  kritisch: 'critical'
} as const

export type TaskPriority = keyof typeof TASK_PRIORITY_MAP
export type PriorityValue = typeof TASK_PRIORITY_MAP[TaskPriority]

export const PRIORITY_COLORS = {
  niedrig: 'bg-gray-100 text-gray-800',
  mittel: 'bg-blue-100 text-blue-800',
  hoch: 'bg-orange-100 text-orange-800',
  kritisch: 'bg-red-100 text-red-800'
} as const
