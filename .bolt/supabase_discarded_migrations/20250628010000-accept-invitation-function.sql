-- Function to accept an invitation atomically
BEGIN;

CREATE OR REPLACE FUNCTION public.accept_household_invitation(
  p_member_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_role household_role
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  rows_updated INTEGER := 0;
BEGIN
  -- Validate required parameters
  IF p_member_id IS NULL OR p_user_id IS NULL OR p_name IS NULL THEN
    RAISE EXCEPTION 'member_id, user_id and name must not be null';
  END IF;

  -- Ensure the invitation exists
  IF NOT EXISTS (SELECT 1 FROM public.household_members WHERE id = p_member_id) THEN
    RAISE EXCEPTION 'Invitation does not exist';
  END IF;

  UPDATE public.household_members
    SET name = p_name,
        role = p_role,
        user_id = p_user_id,
        joined_at = now()
    WHERE id = p_member_id;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  UPDATE public.profiles
    SET full_name = p_name
    WHERE id = p_user_id;

  RETURN rows_updated;
END;
$$;

COMMIT;
