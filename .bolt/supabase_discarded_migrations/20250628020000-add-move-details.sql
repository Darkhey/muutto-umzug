-- Migration to add additional move details to households
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS old_address TEXT,
  ADD COLUMN IF NOT EXISTS new_address TEXT,
  ADD COLUMN IF NOT EXISTS living_space INTEGER,
  ADD COLUMN IF NOT EXISTS rooms INTEGER,
  ADD COLUMN IF NOT EXISTS furniture_volume INTEGER;

