/*
  # Haushalt-Entwürfe Datenmodell
  
  1. Neue Tabellen
    - `household_drafts` - Speichert unvollständige Haushaltsdaten
    - `household_draft_versions` - Speichert Versionshistorie der Entwürfe
  
  2. Sicherheit
    - RLS Policies für beide Tabellen
    - Nutzer können nur ihre eigenen Entwürfe sehen und bearbeiten
  
  3. Funktionen
    - Automatische Versionierung
    - Validierungsstatus
*/

-- Tabelle für Haushalt-Entwürfe
CREATE TABLE IF NOT EXISTS public.household_drafts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'abandoned')),
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  last_step INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  validation_errors JSONB
);

-- Tabelle für Versionsverlauf der Entwürfe
CREATE TABLE IF NOT EXISTS public.household_draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES public.household_drafts(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users NOT NULL,
  UNIQUE(draft_id, version)
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_household_drafts_user_id ON public.household_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_household_drafts_status ON public.household_drafts(status);
CREATE INDEX IF NOT EXISTS idx_household_draft_versions_draft_id ON public.household_draft_versions(draft_id);

-- RLS aktivieren
ALTER TABLE public.household_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_draft_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für household_drafts
CREATE POLICY "Nutzer können ihre eigenen Entwürfe sehen"
  ON public.household_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können ihre eigenen Entwürfe erstellen"
  ON public.household_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können ihre eigenen Entwürfe aktualisieren"
  ON public.household_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können ihre eigenen Entwürfe löschen"
  ON public.household_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies für household_draft_versions
CREATE POLICY "Nutzer können ihre eigenen Entwurfsversionen sehen"
  ON public.household_draft_versions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können ihre eigenen Entwurfsversionen erstellen"
  ON public.household_draft_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Funktion zum Erstellen eines Haushalts aus einem Entwurf
CREATE OR REPLACE FUNCTION create_household_from_draft(
  p_draft_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_household_id UUID;
  v_draft_data JSONB;
  v_user_id UUID;
BEGIN
  -- Entwurfsdaten und Benutzer-ID abrufen
  SELECT data, user_id INTO v_draft_data, v_user_id
  FROM household_drafts
  WHERE id = p_draft_id;
  
  IF v_draft_data IS NULL THEN
    RAISE EXCEPTION 'Entwurf nicht gefunden';
  END IF;
  
  -- Haushalt erstellen
  INSERT INTO households (
    name,
    move_date,
    household_size,
    children_count,
    pets_count,
    property_type,
    postal_code,
    old_address,
    new_address,
    living_space,
    rooms,
    furniture_volume,
    created_by,
    invitation_code
  ) VALUES (
    v_draft_data->>'name',
    (v_draft_data->>'move_date')::DATE,
    COALESCE((v_draft_data->>'household_size')::INTEGER, 1),
    COALESCE((v_draft_data->>'children_count')::INTEGER, 0),
    COALESCE((v_draft_data->>'pets_count')::INTEGER, 0),
    v_draft_data->>'property_type',
    v_draft_data->>'postal_code',
    v_draft_data->>'old_address',
    v_draft_data->>'new_address',
    (v_draft_data->>'living_space')::NUMERIC,
    (v_draft_data->>'rooms')::NUMERIC,
    (v_draft_data->>'furniture_volume')::NUMERIC,
    v_user_id,
    '' -- Wird durch Trigger generiert
  )
  RETURNING id INTO v_household_id;
  
  -- Entwurf als abgeschlossen markieren
  UPDATE household_drafts
  SET status = 'completed', updated_at = now()
  WHERE id = p_draft_id;
  
  -- Mitglieder hinzufügen, falls vorhanden
  IF v_draft_data ? 'members' AND jsonb_array_length(v_draft_data->'members') > 0 THEN
    FOR i IN 0..jsonb_array_length(v_draft_data->'members')-1 LOOP
      INSERT INTO household_members (
        household_id,
        name,
        email,
        role,
        is_owner,
        invited_at
      ) VALUES (
        v_household_id,
        (v_draft_data->'members'->i->>'name'),
        (v_draft_data->'members'->i->>'email'),
        (v_draft_data->'members'->i->>'role'),
        false,
        now()
      );
    END LOOP;
  END IF;
  
  -- Besitzer als Mitglied hinzufügen
  INSERT INTO household_members (
    household_id,
    user_id,
    name,
    email,
    is_owner,
    joined_at
  ) VALUES (
    v_household_id,
    v_user_id,
    (SELECT user_metadata->>'full_name' FROM auth.users WHERE id = v_user_id),
    (SELECT email FROM auth.users WHERE id = v_user_id),
    true,
    now()
  );
  
  RETURN v_household_id;
END;
$$;

-- Trigger für automatische Backups bei Aktualisierungen
CREATE OR REPLACE FUNCTION backup_household_draft_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Nur ein Backup erstellen, wenn sich die Daten geändert haben
  IF OLD.data <> NEW.data THEN
    INSERT INTO household_draft_versions (
      draft_id,
      version,
      data,
      created_at,
      user_id
    ) VALUES (
      OLD.id,
      OLD.version,
      OLD.data,
      now(),
      OLD.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER backup_household_draft
BEFORE UPDATE ON household_drafts
FOR EACH ROW
WHEN (OLD.data IS DISTINCT FROM NEW.data)
EXECUTE FUNCTION backup_household_draft_on_update();