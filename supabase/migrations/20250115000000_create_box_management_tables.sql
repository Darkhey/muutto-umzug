-- Kartonverwaltungssystem Migration
-- Erstellt am 15.01.2025

-- Enum für Kartonstatus
CREATE TYPE box_status AS ENUM ('leer', 'gepackt', 'versiegelt', 'transportiert', 'ausgepackt');

-- Enum für Kartonkategorien
CREATE TYPE box_category AS ENUM ('küche', 'wohnzimmer', 'schlafzimmer', 'bad', 'keller', 'dachboden', 'büro', 'kinderzimmer', 'garten', 'sonstiges');

-- Haupttabelle für Kartons
CREATE TABLE boxes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, box_number)
);

-- Tabelle für Kartonfotos
CREATE TABLE box_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(50) DEFAULT 'content', -- 'content', 'label', 'damage'
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_analysis JSONB -- Speichert die KI-Analyse des Fotos
);

-- Tabelle für Kartoninhalt (KI-generiert und manuell bearbeitet)
CREATE TABLE box_contents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  is_fragile BOOLEAN DEFAULT FALSE,
  estimated_value DECIMAL(10,2),
  category VARCHAR(100),
  ai_detected BOOLEAN DEFAULT FALSE, -- Ob das Item von KI erkannt wurde
  manually_added BOOLEAN DEFAULT FALSE, -- Ob das Item manuell hinzugefügt wurde
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Kartonkommentare
CREATE TABLE box_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'general', -- 'general', 'question', 'reminder', 'note'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Kartonverfolgung (wo ist der Karton gerade?)
CREATE TABLE box_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id uuid REFERENCES boxes(id) ON DELETE CASCADE NOT NULL,
  location_type VARCHAR(50) NOT NULL, -- 'source_house', 'destination_house', 'storage', 'transport', 'other'
  location_name VARCHAR(255) NOT NULL,
  room VARCHAR(100),
  notes TEXT,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE -- Nur ein Eintrag pro Karton sollte TRUE sein
);

-- Indexe für bessere Performance
CREATE INDEX idx_boxes_household_id ON boxes(household_id);
CREATE INDEX idx_boxes_status ON boxes(status);
CREATE INDEX idx_boxes_category ON boxes(category);
CREATE INDEX idx_box_photos_box_id ON box_photos(box_id);
CREATE INDEX idx_box_contents_box_id ON box_contents(box_id);
CREATE INDEX idx_box_comments_box_id ON box_comments(box_id);
CREATE INDEX idx_box_locations_box_id ON box_locations(box_id);
CREATE INDEX idx_box_locations_current ON box_locations(box_id, is_current) WHERE is_current = TRUE;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_boxes_updated_at BEFORE UPDATE ON boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_box_contents_updated_at BEFORE UPDATE ON box_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für Box-Location: Nur ein aktueller Standort pro Karton
CREATE OR REPLACE FUNCTION ensure_single_current_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = TRUE THEN
        UPDATE box_locations 
        SET is_current = FALSE 
        WHERE box_id = NEW.box_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER ensure_single_current_location_trigger 
    BEFORE INSERT OR UPDATE ON box_locations
    FOR EACH ROW EXECUTE FUNCTION ensure_single_current_location();

-- Row Level Security aktivieren
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies für boxes
CREATE POLICY "Users can view boxes from their households" ON boxes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM household_members 
            WHERE household_id = boxes.household_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert boxes in their households" ON boxes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM household_members 
            WHERE household_id = boxes.household_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update boxes in their households" ON boxes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM household_members 
            WHERE household_id = boxes.household_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete boxes in their households" ON boxes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM household_members 
            WHERE household_id = boxes.household_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies für box_photos
CREATE POLICY "Users can view box photos from their households" ON box_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_photos.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert box photos in their households" ON box_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_photos.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update box photos in their households" ON box_photos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_photos.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete box photos in their households" ON box_photos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_photos.box_id 
            AND hm.user_id = auth.uid()
        )
    );

-- RLS Policies für box_contents
CREATE POLICY "Users can view box contents from their households" ON box_contents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_contents.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert box contents in their households" ON box_contents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_contents.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update box contents in their households" ON box_contents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_contents.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete box contents in their households" ON box_contents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_contents.box_id 
            AND hm.user_id = auth.uid()
        )
    );

-- RLS Policies für box_comments
CREATE POLICY "Users can view box comments from their households" ON box_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_comments.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert box comments in their households" ON box_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_comments.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own box comments" ON box_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own box comments" ON box_comments
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies für box_locations
CREATE POLICY "Users can view box locations from their households" ON box_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_locations.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert box locations in their households" ON box_locations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_locations.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update box locations in their households" ON box_locations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_locations.box_id 
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete box locations in their households" ON box_locations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM boxes b
            JOIN household_members hm ON b.household_id = hm.household_id
            WHERE b.id = box_locations.box_id 
            AND hm.user_id = auth.uid()
        )
    );

-- Funktion zum Suchen von Gegenständen in Kartons
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