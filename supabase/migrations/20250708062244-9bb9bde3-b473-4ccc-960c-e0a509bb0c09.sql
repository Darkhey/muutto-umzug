-- Phase 1: Box Management Database Foundation
-- Create storage bucket for box photos
INSERT INTO storage.buckets (id, name, public) VALUES ('box-photos', 'box-photos', true);

-- Create storage policies for box photos
CREATE POLICY "Box photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'box-photos');

CREATE POLICY "Users can upload box photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'box-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their box photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'box-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their box photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'box-photos' AND auth.uid() IS NOT NULL);

-- Add household_id column to boxes table to link with households
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS household_id uuid REFERENCES public.households(id) ON DELETE CASCADE;

-- Create index for household_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_boxes_household_id ON boxes(household_id);

-- Update RLS policies for boxes to work with household_id
DROP POLICY IF EXISTS "Users can view boxes from their households" ON boxes;
DROP POLICY IF EXISTS "Users can insert boxes in their households" ON boxes;
DROP POLICY IF EXISTS "Users can update boxes in their households" ON boxes;
DROP POLICY IF EXISTS "Users can delete boxes in their households" ON boxes;

CREATE POLICY "Users can view boxes from their households" ON boxes
    FOR SELECT USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
        )
    );

CREATE POLICY "Users can insert boxes in their households" ON boxes
    FOR INSERT WITH CHECK (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
        )
    );

CREATE POLICY "Users can update boxes in their households" ON boxes
    FOR UPDATE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
        )
    );

CREATE POLICY "Users can delete boxes in their households" ON boxes
    FOR DELETE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
        )
    );