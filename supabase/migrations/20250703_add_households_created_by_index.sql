-- Add index on households.created_by for better query performance
-- This index improves performance when joining households with profiles
CREATE INDEX idx_households_created_by ON households(created_by);

-- Add comment explaining the purpose
COMMENT ON INDEX idx_households_created_by IS 'Improves performance for queries joining households with user profiles'; 