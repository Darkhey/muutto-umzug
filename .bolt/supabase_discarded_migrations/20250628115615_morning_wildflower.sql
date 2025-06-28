/*
  # RLS Policies für sichere Datentrennung

  1. Sicherheitsfunktionen
    - `user_is_household_member` - Prüft Haushaltsmitgliedschaft
    - `user_is_household_owner` - Prüft Haushaltsbesitzer
  
  2. RLS Policies
    - Haushalte: Nur Mitglieder können zugreifen
    - Mitglieder: Sichere Verwaltung und Einladungen
    - Profile: Eigene Daten bearbeiten, alle anzeigen
  
  3. Zusätzliche Funktionen
    - `join_household_by_code` - Haushalt per Code beitreten
    - `accept_household_invitation` - Einladung annehmen
*/

-- Create security definer function to check household membership
CREATE OR REPLACE FUNCTION public.user_is_household_member(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = p_household_id 
    AND (user_id = auth.uid() OR (user_id IS NULL AND email = auth.email()))
  );
$$;

-- Create security definer function to check if user is household owner
CREATE OR REPLACE FUNCTION public.user_is_household_owner(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.households 
    WHERE id = p_household_id 
    AND created_by = auth.uid()
  );
$$;

-- RLS policies for households
CREATE POLICY "Users can view their households"
  ON public.households FOR SELECT
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = households.id 
      AND (user_id = auth.uid() OR email = auth.email())
    )
  );

CREATE POLICY "Users can create households"
  ON public.households FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update their households"
  ON public.households FOR UPDATE
  USING (created_by = auth.uid());

-- RLS policies for household_members
CREATE POLICY "Users can view household members"
  ON public.household_members FOR SELECT
  USING (public.user_is_household_member(household_id));

CREATE POLICY "Household owners can manage members"
  ON public.household_members FOR ALL
  USING (public.user_is_household_owner(household_id));

CREATE POLICY "Users can accept invitations"
  ON public.household_members FOR UPDATE
  USING (email = auth.email() AND user_id IS NULL);

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

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

-- Function to accept an invitation atomically
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