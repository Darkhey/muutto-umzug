import { CreateHouseholdData } from '@/hooks/useHouseholds';

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