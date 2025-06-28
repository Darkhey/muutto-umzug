
-- Fix RLS policies for household_members to prevent infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Household owners can manage members" ON public.household_members;
DROP POLICY IF EXISTS "Users can update their own member record" ON public.household_members;

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

-- New RLS policies using security definer functions
CREATE POLICY "Users can view household members"
  ON public.household_members FOR SELECT
  USING (public.user_is_household_member(household_id));

CREATE POLICY "Household owners can manage members"
  ON public.household_members FOR ALL
  USING (public.user_is_household_owner(household_id));

CREATE POLICY "Users can accept invitations"
  ON public.household_members FOR UPDATE
  USING (email = auth.email() AND user_id IS NULL);

-- Fix households RLS policies
DROP POLICY IF EXISTS "Users can view households they are members of" ON public.households;
DROP POLICY IF EXISTS "Users can create households" ON public.households;
DROP POLICY IF EXISTS "Household owners can update their households" ON public.households;

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

-- Fix invitation code generation function
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

-- Update trigger function
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
