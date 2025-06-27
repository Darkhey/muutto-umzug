
import { APP_CONFIG } from '@/config/app';

export interface ProgressMetrics {
  overall: number;
  tasksCompleted: number;
  totalTasks: number;
  timeProgress: number;
  daysRemaining: number;
}

export const calculateHouseholdProgress = (
  moveDate: string,
  completedTasks: number = 0,
  totalTasks: number = 1
): ProgressMetrics => {
  const now = new Date();
  const moveDateObj = new Date(moveDate);
  const daysRemaining = Math.ceil((moveDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Zeit-basierter Progress: 100% wenn Umzug in der Vergangenheit
  const timeProgress = Math.min(100, Math.max(0, 
    100 - (daysRemaining / APP_CONFIG.progress.daysForFullProgress) * 100
  ));
  
  // Aufgaben-basierter Progress
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Gewichteter Gesamt-Progress
  const overall = Math.round(
    (taskProgress * APP_CONFIG.progress.completionWeight) + 
    (timeProgress * APP_CONFIG.progress.timeWeight)
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    tasksCompleted: completedTasks,
    totalTasks,
    timeProgress: Math.round(timeProgress),
    daysRemaining: Math.max(0, daysRemaining)
  };
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'text-green-600';
  if (progress >= 50) return 'text-blue-600';
  if (progress >= 25) return 'text-yellow-600';
  return 'text-red-600';
};

export const getProgressBgColor = (progress: number): string => {
  if (progress >= 80) return 'bg-green-600';
  if (progress >= 50) return 'bg-blue-600';
  if (progress >= 25) return 'bg-yellow-600';
  return 'bg-red-600';
};
