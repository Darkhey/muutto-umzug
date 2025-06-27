-- Add invitation_code column and functions
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE
  CHECK (length(invitation_code) = 12);

-- Function to generate secure 12-character invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(
      chars,
      (get_byte(gen_random_bytes(1), 0) % length(chars)) + 1,
      1
    );
  END LOOP;
  RETURN result;
END;
$$;

-- Helper to ensure uniqueness against existing rows
CREATE OR REPLACE FUNCTION generate_unique_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := generate_invitation_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.households WHERE invitation_code = code
    );
  END LOOP;
  RETURN code;
END;
$$;

-- Populate existing households
UPDATE public.households
SET invitation_code = generate_unique_invitation_code()
WHERE invitation_code IS NULL;

-- Set NOT NULL constraint
ALTER TABLE public.households
  ALTER COLUMN invitation_code SET NOT NULL;

-- Trigger function for new households
CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_unique_invitation_code();
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.households WHERE invitation_code = NEW.invitation_code
    ) THEN
      RAISE EXCEPTION 'Invitation code already exists';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS households_invitation_code_trigger ON public.households;
CREATE TRIGGER households_invitation_code_trigger
  BEFORE INSERT ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code();

-- Function to join household by invitation code
CREATE OR REPLACE FUNCTION join_household_by_code(
  p_invitation_code TEXT,
  p_user_id UUID,
  p_user_name TEXT,
  p_user_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  household_id_result UUID;
BEGIN
  PERFORM set_config('search_path', 'public', true);
  SELECT id INTO household_id_result
  FROM public.households
  WHERE invitation_code = p_invitation_code;

  IF household_id_result IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation code';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = household_id_result
      AND (user_id = p_user_id OR email = p_user_email)
  ) THEN
    RAISE EXCEPTION 'User is already a member of this household';
  END IF;

  INSERT INTO public.household_members (
    household_id,
    user_id,
    name,
    email,
    is_owner,
    joined_at
  ) VALUES (
    household_id_result,
    p_user_id,
    p_user_name,
    p_user_email,
    false,
    now()
  );

  RETURN household_id_result;
END;
$$;
