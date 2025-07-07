
-- Create enum for user roles in household
CREATE TYPE public.household_role AS ENUM (
  'vertragsmanager',
  'packbeauftragte', 
  'finanzperson',
  'renovierer',
  'haustierverantwortliche'
);

-- Create enum for property type
CREATE TYPE public.property_type AS ENUM ('miete', 'eigentum');

-- Create households table
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  move_date DATE NOT NULL,
  household_size INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  pets_count INTEGER NOT NULL DEFAULT 0,
  property_type property_type NOT NULL,
  postal_code TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create household members table
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role household_role,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for households
CREATE POLICY "Users can view households they are members of" 
  ON public.households FOR SELECT 
  USING (
    id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  );

CREATE POLICY "Users can create households" 
  ON public.households FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Household owners can update their households" 
  ON public.households FOR UPDATE 
  USING (auth.uid() = created_by);

-- RLS policies for household_members
CREATE POLICY "Users can view members of their households" 
  ON public.household_members FOR SELECT 
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  );

CREATE POLICY "Household owners can manage members" 
  ON public.household_members FOR ALL 
  USING (
    household_id IN (
      SELECT id FROM public.households WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own member record" 
  ON public.household_members FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
