import type { Database as SupabaseDatabase, Constants } from '@/integrations/supabase/types'

export type Database = SupabaseDatabase

export type HouseholdRole = SupabaseDatabase['public']['Enums']['household_role']
export type PropertyType = SupabaseDatabase['public']['Enums']['property_type']
export type TaskPhase = SupabaseDatabase['public']['Enums']['task_phase']
export type TaskPriority = SupabaseDatabase['public']['Enums']['task_priority']
export { Constants }

