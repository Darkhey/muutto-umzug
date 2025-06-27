-- Function to accept an invitation atomically
CREATE OR REPLACE FUNCTION public.accept_household_invitation(
  p_member_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_role household_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.household_members
    SET name = p_name,
        role = p_role,
        user_id = p_user_id,
        joined_at = now()
    WHERE id = p_member_id;

  UPDATE public.profiles
    SET full_name = p_name
    WHERE id = p_user_id;
END;
$$;
