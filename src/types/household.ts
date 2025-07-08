
import { Database } from './database';

export type Household = Database['public']['Tables']['households']['Row'];
export type HouseholdInsert = Database['public']['Tables']['households']['Insert'];
export type HouseholdMember = {
  created_at: string;
  email: string | null;
  household_id: string;
  id: string;
  invited_at: string | null;
  is_owner: boolean;
  joined_at: string | null; // Nullable to match database schema
  name: string;
  role: Database["public"]["Enums"]["household_role"] | null;
  user_id: string | null;
};
export type HouseholdRole = Database['public']['Tables']['household_members']['Row']['role'];

export interface ExtendedHousehold extends Household {
  members?: HouseholdMember[];
  progress?: number;
  nextDeadline?: string;
  daysUntilMove?: number;
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

// Einheitliche Onboarding-Datenstruktur
export interface OnboardingData {
  householdName: string;
  moveDate: string;
  householdSize: number;
  childrenCount: number;
  petsCount: number;
  propertyType: 'miete' | 'eigentum';
  postalCode: string;
  oldAddress: string;
  newAddress: string;
  livingSpace: number;
  rooms: number;
  furnitureVolume: number;
  ownsCar?: boolean;
  isSelfEmployed?: boolean;
  adUrl?: string;
  members: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}
