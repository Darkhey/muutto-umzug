/*
  # Add missing household detail columns

  1. New Columns
    - `old_address` (text, nullable) - Current address of the household
    - `new_address` (text, nullable) - New address for the move
    - `living_space` (integer, nullable) - Living space in square meters
    - `rooms` (integer, nullable) - Number of rooms
    - `furniture_volume` (integer, nullable) - Furniture volume in cubic meters

  2. Changes
    - All columns are nullable as they are optional fields
    - Added to existing `households` table
*/

-- Add missing columns to households table
DO $$
BEGIN
  -- Add old_address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'households' AND column_name = 'old_address'
  ) THEN
    ALTER TABLE public.households ADD COLUMN old_address TEXT;
  END IF;

  -- Add new_address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'households' AND column_name = 'new_address'
  ) THEN
    ALTER TABLE public.households ADD COLUMN new_address TEXT;
  END IF;

  -- Add living_space column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'households' AND column_name = 'living_space'
  ) THEN
    ALTER TABLE public.households ADD COLUMN living_space INTEGER;
  END IF;

  -- Add rooms column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'households' AND column_name = 'rooms'
  ) THEN
    ALTER TABLE public.households ADD COLUMN rooms INTEGER;
  END IF;

  -- Add furniture_volume column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'households' AND column_name = 'furniture_volume'
  ) THEN
    ALTER TABLE public.households ADD COLUMN furniture_volume INTEGER;
  END IF;
END $$;