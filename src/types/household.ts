
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
  owns_car?: boolean;
  is_self_employed?: boolean;
  parent_household_id?: string | null; // New field for linking households to a parent move
  created_by_user_profile?: {
    full_name?: string;
    has_children?: boolean;
    has_pets?: boolean;
    owns_car?: boolean;
    is_self_employed?: boolean;
  };
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

export interface CreateHouseholdData {
  householdName: string;
  moveDate: string;
  householdSize: number;
  childrenCount: number;
  petsCount: number;
  propertyType: 'miete' | 'eigentum';
  postalCode?: string;
  oldAddress?: string;
  newAddress?: string;
  livingSpace?: number;
  rooms?: number;
  furnitureVolume?: number;
  ownsCar?: boolean;
  isSelfEmployed?: boolean;
  adUrl?: string;
  members?: Array<{
    name: string;
    email: string;
    role?: string;
  }>;
}
