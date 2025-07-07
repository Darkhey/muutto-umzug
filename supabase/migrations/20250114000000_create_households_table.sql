-- Create households table
CREATE TABLE IF NOT EXISTS public.households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  move_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitation_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create household_members table
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_households_created_by ON public.households(created_by);
CREATE INDEX IF NOT EXISTS idx_households_invitation_code ON public.households(invitation_code);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);

-- Enable RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for households
CREATE POLICY "Users can view their households"
ON public.households FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = households.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create households"
ON public.households FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their households"
ON public.households FOR UPDATE
USING (auth.uid() = created_by);

-- RLS policies for household_members
CREATE POLICY "Users can view members of their households"
ON public.household_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = household_members.household_id AND hm.user_id = auth.uid()
  )
);

CREATE POLICY "Household owners can manage members"
ON public.household_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.id = household_members.household_id AND h.created_by = auth.uid()
  )
);

-- Function to check invitation code
CREATE OR REPLACE FUNCTION check_invitation_code(code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.households WHERE invitation_code = code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new households
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate a unique invitation code
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.households WHERE invitation_code = new_code AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      NEW.invitation_code := new_code;
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique invitation code after 100 attempts';
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation code generation
DROP TRIGGER IF EXISTS households_invitation_code_trigger ON public.households;
CREATE TRIGGER households_invitation_code_trigger
  BEFORE INSERT OR UPDATE ON public.households
  FOR EACH ROW
  WHEN (NEW.invitation_code IS NULL)
  EXECUTE FUNCTION generate_invitation_code();

-- Create trigger for updated_at
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 