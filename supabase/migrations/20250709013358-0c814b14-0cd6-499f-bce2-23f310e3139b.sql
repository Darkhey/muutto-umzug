-- Add missing fields from expanded onboarding process to households table
ALTER TABLE public.households 
ADD COLUMN IF NOT EXISTS has_garden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_cellar_or_garage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ad_url TEXT,
ADD COLUMN IF NOT EXISTS household_type TEXT DEFAULT 'single',
ADD COLUMN IF NOT EXISTS inventory_style TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS special_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS works_from_home BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hobbies TEXT,
ADD COLUMN IF NOT EXISTS move_style TEXT DEFAULT 'mixed';

-- Create pets table for detailed pet information
CREATE TABLE IF NOT EXISTS public.household_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  pet_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on household_pets table
ALTER TABLE public.household_pets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for household_pets
CREATE POLICY "Users can view pets from their households" ON public.household_pets
FOR SELECT USING (
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  )
);

CREATE POLICY "Users can insert pets in their households" ON public.household_pets
FOR INSERT WITH CHECK (
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  )
);

CREATE POLICY "Users can update pets in their households" ON public.household_pets
FOR UPDATE USING (
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  )
);

CREATE POLICY "Users can delete pets from their households" ON public.household_pets
FOR DELETE USING (
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  )
);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_household_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_household_pets_updated_at
  BEFORE UPDATE ON public.household_pets
  FOR EACH ROW
  EXECUTE FUNCTION update_household_pets_updated_at();