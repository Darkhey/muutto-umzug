-- Box Management System - Complete Schema Creation
-- Phase 1: Create all tables and storage

-- Create storage bucket for box photos
INSERT INTO storage.buckets (id, name, public) VALUES ('box-photos', 'box-photos', true)
ON CONFLICT (id) DO NOTHING;

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

-- Create enum types for box management
CREATE TYPE box_status AS ENUM ('leer', 'gepackt', 'versiegelt', 'transportiert', 'ausgepackt');
CREATE TYPE box_category AS ENUM ('küche', 'wohnzimmer', 'schlafzimmer', 'bad', 'keller', 'dachboden', 'büro', 'kinderzimmer', 'garten', 'sonstiges');

-- Main boxes table
CREATE TABLE boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  box_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  category box_category DEFAULT 'sonstiges',
  status box_status DEFAULT 'leer',
  source_household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  destination_household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  room VARCHAR(100),
  weight_kg DECIMAL(5,2),
  dimensions_cm JSONB, -- {length, width, height}
  created_by uuid NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, box_number)
);

-- Box photos table
CREATE TABLE box_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(50) DEFAULT 'content', -- 'content', 'label', 'damage'
  uploaded_by uuid NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_analysis JSONB -- Stores AI analysis of the photo
);

-- Box contents table
CREATE TABLE box_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  is_fragile BOOLEAN DEFAULT FALSE,
  estimated_value DECIMAL(10,2),
  category VARCHAR(100),
  ai_detected BOOLEAN DEFAULT FALSE,
  manually_added BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Box comments table
CREATE TABLE box_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'general', -- 'general', 'question', 'reminder', 'note'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Box locations table (tracking where boxes are)
CREATE TABLE box_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  location_type VARCHAR(50) NOT NULL, -- 'source_house', 'destination_house', 'storage', 'transport', 'other'
  location_name VARCHAR(255) NOT NULL,
  room VARCHAR(100),
  notes TEXT,
  recorded_by uuid NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX idx_boxes_household_id ON boxes(household_id);
CREATE INDEX idx_boxes_status ON boxes(status);
CREATE INDEX idx_boxes_category ON boxes(category);
CREATE INDEX idx_box_photos_box_id ON box_photos(box_id);
CREATE INDEX idx_box_contents_box_id ON box_contents(box_id);
CREATE INDEX idx_box_comments_box_id ON box_comments(box_id);
CREATE INDEX idx_box_locations_box_id ON box_locations(box_id);
CREATE INDEX idx_box_locations_current ON box_locations(box_id, is_current) WHERE is_current = TRUE;

-- Enable RLS
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boxes
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

-- RLS Policies for box_photos
CREATE POLICY "Users can view box photos from their households" ON box_photos
    FOR SELECT USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can insert box photos in their households" ON box_photos
    FOR INSERT WITH CHECK (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can update box photos in their households" ON box_photos
    FOR UPDATE USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can delete box photos in their households" ON box_photos
    FOR DELETE USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

-- RLS Policies for box_contents
CREATE POLICY "Users can view box contents from their households" ON box_contents
    FOR SELECT USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can insert box contents in their households" ON box_contents
    FOR INSERT WITH CHECK (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can update box contents in their households" ON box_contents
    FOR UPDATE USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL and hm.email = auth.email())
        )
    );

CREATE POLICY "Users can delete box contents in their households" ON box_contents
    FOR DELETE USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

-- RLS Policies for box_comments
CREATE POLICY "Users can view box comments from their households" ON box_comments
    FOR SELECT USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can insert box comments in their households" ON box_comments
    FOR INSERT WITH CHECK (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can update their own box comments" ON box_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own box comments" ON box_comments
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for box_locations
CREATE POLICY "Users can view box locations from their households" ON box_locations
    FOR SELECT USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can insert box locations in their households" ON box_locations
    FOR INSERT WITH CHECK (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can update box locations in their households" ON box_locations
    FOR UPDATE USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

CREATE POLICY "Users can delete box locations in their households" ON box_locations
    FOR DELETE USING (
        box_id IN (
            SELECT b.id FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE hm.user_id = auth.uid() OR (hm.user_id IS NULL AND hm.email = auth.email())
        )
    );

-- Search function for box contents
CREATE OR REPLACE FUNCTION search_items_in_boxes(
    p_household_id uuid,
    p_search_term text
)
RETURNS TABLE (
    box_id uuid,
    box_number text,
    box_name text,
    item_name text,
    item_description text,
    box_status box_status,
    current_location text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as box_id,
        b.box_number,
        b.name as box_name,
        bc.item_name,
        bc.description as item_description,
        b.status as box_status,
        bl.location_name as current_location
    FROM boxes b
    LEFT JOIN box_contents bc ON b.id = bc.box_id
    LEFT JOIN box_locations bl ON b.id = bl.box_id AND bl.is_current = TRUE
    WHERE b.household_id = p_household_id
    AND (
        bc.item_name ILIKE '%' || p_search_term || '%'
        OR bc.description ILIKE '%' || p_search_term || '%'
        OR b.name ILIKE '%' || p_search_term || '%'
        OR b.description ILIKE '%' || p_search_term || '%'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;