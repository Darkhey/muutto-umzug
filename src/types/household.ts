
import { Database } from './database';

export type Household = Database['public']['Tables']['households']['Row'];
export type HouseholdInsert = Database['public']['Tables']['households']['Insert'];
export type HouseholdMember = Database['public']['Tables']['household_members']['Row'];
export type HouseholdRole = Database['public']['Tables']['household_members']['Row']['role'];

export interface ExtendedHousehold extends Household {
  members?: HouseholdMember[];
  progress?: number;
  nextDeadline?: string;
  daysUntilMove?: number;
}

export interface HouseholdWithProgress extends Household {
  progress: {
    overall: number;
    tasksCompleted: number;
    totalTasks: number;
    daysRemaining: number;
  };
  memberCount: number;
}
