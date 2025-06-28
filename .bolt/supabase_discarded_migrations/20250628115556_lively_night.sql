/*
  # Basis-Schema für muutto

  1. Neue Tabellen
    - `profiles` - Benutzerprofile
    - `households` - Haushalte mit Umzugsdaten
    - `household_members` - Haushaltsmitglieder mit Rollen
  
  2. Enums
    - `household_role` - Rollen im Haushalt
    - `property_type` - Miet- oder Eigentumswohnung
  
  3. Sicherheit
    - RLS aktiviert für alle Tabellen
    - Sichere Policies für Datentrennung
    - Automatische Profilerstellung
*/

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
CREATE TABLE IF NOT EXISTS public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  move_date DATE NOT NULL,
  household_size INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  pets_count INTEGER NOT NULL DEFAULT 0,
  property_type property_type NOT NULL,
  postal_code TEXT,
  old_address TEXT,
  new_address TEXT,
  living_space INTEGER,
  rooms INTEGER,
  furniture_volume INTEGER,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invitation_code TEXT UNIQUE NOT NULL
);

-- Create household members table
CREATE TABLE IF NOT EXISTS public.household_members (
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
CREATE TABLE IF NOT EXISTS public.profiles (
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
      SELECT 1 FROM public.households WHERE invitation_code = NEW.invitation_code AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Invitation code already exists';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for invitation codes
DROP TRIGGER IF EXISTS households_invitation_code_trigger ON public.households;
CREATE TRIGGER households_invitation_code_trigger
  BEFORE INSERT OR UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code();

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();