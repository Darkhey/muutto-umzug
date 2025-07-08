-- Add missing nullable columns to households table
ALTER TABLE public.households 
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS old_address TEXT,
ADD COLUMN IF NOT EXISTS new_address TEXT,
ADD COLUMN IF NOT EXISTS living_space INTEGER,
ADD COLUMN IF NOT EXISTS rooms INTEGER,
ADD COLUMN IF NOT EXISTS furniture_volume INTEGER,
ADD COLUMN IF NOT EXISTS owns_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_self_employed BOOLEAN DEFAULT false;