/*
  # Household Merger Function
  
  1. New Functions
    - `merge_households` - Merges multiple source households into a destination household
  
  2. Security
    - Function is SECURITY DEFINER to ensure proper permissions
    - Validates user is owner of all households involved
  
  3. Features
    - Handles member conflicts with "first come wins" strategy
    - Transfers tasks from source to destination households
    - Maintains data integrity with transaction support
*/

-- Function to merge households
CREATE OR REPLACE FUNCTION merge_households(
  p_source_household_ids UUID[],
  p_destination_household_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_id UUID;
  v_member RECORD;
  v_task RECORD;
  v_conflict_count INTEGER := 0;
  v_transferred_member_count INTEGER := 0;
  v_transferred_task_count INTEGER := 0;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Validate inputs
  IF p_source_household_ids IS NULL OR array_length(p_source_household_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No source households provided';
  END IF;
  
  IF p_destination_household_id IS NULL THEN
    RAISE EXCEPTION 'No destination household provided';
  END IF;
  
  -- Check if destination household exists
  IF NOT EXISTS (SELECT 1 FROM households WHERE id = p_destination_household_id) THEN
    RAISE EXCEPTION 'Destination household does not exist';
  END IF;
  
  -- Check if user is owner of destination household
  IF NOT EXISTS (
    SELECT 1 FROM households 
    WHERE id = p_destination_household_id AND created_by = v_user_id
  ) THEN
    RAISE EXCEPTION 'You must be the owner of the destination household';
  END IF;
  
  -- Check if destination is in source list
  IF p_destination_household_id = ANY(p_source_household_ids) THEN
    RAISE EXCEPTION 'Destination household cannot be in the source list';
  END IF;
  
  -- Check if user is owner of all source households
  IF EXISTS (
    SELECT 1 FROM households 
    WHERE id = ANY(p_source_household_ids) AND created_by <> v_user_id
  ) THEN
    RAISE EXCEPTION 'You must be the owner of all source households';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Process each source household
    FOREACH v_source_id IN ARRAY p_source_household_ids
    LOOP
      -- Transfer members
      FOR v_member IN (
        SELECT * FROM household_members WHERE household_id = v_source_id
      )
      LOOP
        -- Check for conflicts (same user_id or email)
        IF v_member.user_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM household_members 
          WHERE household_id = p_destination_household_id AND user_id = v_member.user_id
        ) THEN
          -- Skip this member (first come wins)
          v_conflict_count := v_conflict_count + 1;
          CONTINUE;
        ELSIF v_member.email IS NOT NULL AND EXISTS (
          SELECT 1 FROM household_members 
          WHERE household_id = p_destination_household_id AND email = v_member.email
        ) THEN
          -- Skip this member (first come wins)
          v_conflict_count := v_conflict_count + 1;
          CONTINUE;
        END IF;
        
        -- Transfer member to destination household
        UPDATE household_members
        SET 
          household_id = p_destination_household_id,
          is_owner = CASE WHEN v_member.user_id = v_user_id THEN true ELSE false END
        WHERE id = v_member.id;
        
        v_transferred_member_count := v_transferred_member_count + 1;
      END LOOP;
      
      -- Transfer tasks
      FOR v_task IN (
        SELECT * FROM tasks WHERE household_id = v_source_id
      )
      LOOP
        -- Transfer task to destination household
        UPDATE tasks
        SET household_id = p_destination_household_id
        WHERE id = v_task.id;
        
        v_transferred_task_count := v_transferred_task_count + 1;
      END LOOP;
      
      -- Delete source household
      DELETE FROM households WHERE id = v_source_id;
    END LOOP;
    
    -- Update household size in destination
    UPDATE households
    SET 
      household_size = (SELECT COUNT(*) FROM household_members WHERE household_id = p_destination_household_id),
      updated_at = now()
    WHERE id = p_destination_household_id;
    
    -- Commit transaction
    RETURN p_destination_household_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$;

-- Function to check if households can be merged
CREATE OR REPLACE FUNCTION can_merge_households(
  p_household_ids UUID[]
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is owner of all households
  RETURN NOT EXISTS (
    SELECT 1 FROM households 
    WHERE id = ANY(p_household_ids) AND created_by <> v_user_id
  );
END;
$$;