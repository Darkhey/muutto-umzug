-- Fix foreign key constraint for households.created_by
-- Drop existing constraint if it exists
ALTER TABLE public.households DROP CONSTRAINT IF EXISTS households_created_by_fkey;

-- Make sure created_by can reference auth.users (which is the correct table for user IDs)
-- The created_by field should reference auth.users.id, not profiles.id
ALTER TABLE public.households 
ADD CONSTRAINT households_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;