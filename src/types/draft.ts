export interface CreateHouseholdData {
  name: string;
  move_date: string;
  household_size: number;
  children_count: number;
  pets_count: number;
  property_type: 'miete' | 'eigentum';
  postal_code?: string;
  old_address?: string;
  new_address?: string;
  living_space?: number;
  rooms?: number;
  furniture_volume?: number;
  pet_types?: string;
  important_notes?: string;
}

export interface HouseholdDraft {
  id: string;
  data: Partial<CreateHouseholdData>;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'abandoned';
  userId: string;
  completionPercentage: number;
  lastStep: number;
  version: number;
  validationErrors?: Record<string, string>;
}

export interface DraftSummary {
  id: string;
  name: string | null;
  updatedAt: string;
  completionPercentage: number;
  status: 'draft' | 'completed' | 'abandoned';
}