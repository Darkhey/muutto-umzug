import { Database } from './database';

export type Household = Database['public']['Tables']['households']['Row'];
export type HouseholdInsert = Database['public']['Tables']['households']['Insert'];
export type HouseholdMember = Database['public']['Tables']['household_members']['Row'];
export type HouseholdRole = Database['public']['Tables']['household_members']['Row']['role'];

// Define profile type from database
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ExtendedHousehold extends Household {
  members?: HouseholdMember[];
  progress?: number;
  nextDeadline?: string;
  daysUntilMove?: number;
  created_by_user_profile?: Profile;
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
