-- Erweiterte Template-Daten für personalisierte Checklisten

-- Basis-Templates (für alle)
INSERT INTO checklist_templates (title, description, phase, priority, category, days_before_move, conditions) VALUES
('Einwohnermeldeamt - Ummeldung', 'Neue Adresse beim Einwohnermeldeamt anmelden', 'nach_umzug', 'hoch', 'Behörden', -14, '{}'),
('Hausarzt finden', 'Neuen Hausarzt in der Nähe suchen und Patientenakte übertragen lassen', 'nach_umzug', 'mittel', 'Gesundheit', -30, '{}'),
('Strom anmelden', 'Stromanbieter für neue Adresse beauftragen', 'vor_umzug', 'hoch', 'Verträge', 14, '{}'),
('Internet/Telefon ummelden', 'DSL/Kabel-Anschluss für neue Wohnung beantragen', 'vor_umzug', 'hoch', 'Verträge', 21, '{}'),
('Versicherungen informieren', 'Alle Versicherungen über Adressänderung informieren', 'nach_umzug', 'mittel', 'Verträge', -7, '{}'),

-- Familien-spezifische Templates (children_count > 0)
('Schule/Kita ummelden', 'Kinder in neuer Schule oder Kita anmelden', 'vor_umzug', 'hoch', 'Familie', 30, '{"children_count_min": 1}'),
('Kinderarzt finden', 'Neuen Kinderarzt finden und Unterlagen übertragen', 'nach_umzug', 'hoch', 'Gesundheit', -14, '{"children_count_min": 1}'),
('Kindergeld ummelden', 'Familienkasse über neue Adresse informieren', 'nach_umzug', 'mittel', 'Behörden', -30, '{"children_count_min": 1}'),
('Spielplätze erkunden', 'Spielplätze und Freizeitangebote in der Nähe finden', 'nach_umzug', 'niedrig', 'Freizeit', -60, '{"children_count_min": 1}'),

-- Haustier-spezifische Templates (pets_count > 0)
('Tierarzt finden', 'Neuen Tierarzt in der Nähe finden', 'nach_umzug', 'hoch', 'Haustiere', -7, '{"pets_count_min": 1}'),
('Hundesteuern ummelden', 'Hund bei neuer Gemeinde anmelden', 'nach_umzug', 'hoch', 'Behörden', -14, '{"pets_count_min": 1, "pet_types": ["hund"]}'),
('Tiersitter organisieren', 'Betreuung für Umzugstag organisieren', 'vor_umzug', 'mittel', 'Haustiere', 7, '{"pets_count_min": 1}'),
('Futter-Vorrat anlegen', 'Genug Futter für Übergangszeit besorgen', 'vor_umzug', 'niedrig', 'Haustiere', 3, '{"pets_count_min": 1}'),

-- Auto-spezifische Templates (owns_car = true)
('KFZ ummelden', 'Auto bei neuer Zulassungsstelle ummelden', 'nach_umzug', 'hoch', 'Behörden', -14, '{"owns_car": true}'),
('Parkplatz organisieren', 'Parkplatz oder Garage in neuer Umgebung sichern', 'vor_umzug', 'mittel', 'Wohnen', 14, '{"owns_car": true}'),
('TÜV-Termine prüfen', 'Anstehende TÜV-Termine berücksichtigen', 'vor_umzug', 'niedrig', 'Fahrzeug', 30, '{"owns_car": true}'),
('Tankstellen erkunden', 'Günstige Tankstellen in neuer Umgebung finden', 'nach_umzug', 'niedrig', 'Fahrzeug', -30, '{"owns_car": true}'),

-- Selbstständigen-spezifische Templates (is_self_employed = true)
('Gewerbe ummelden', 'Gewerbeanmeldung auf neue Adresse ändern', 'nach_umzug', 'hoch', 'Gewerbe', -14, '{"is_self_employed": true}'),
('Steuerberatung informieren', 'Steuerberater über Umzug informieren', 'nach_umzug', 'mittel', 'Gewerbe', -7, '{"is_self_employed": true}'),
('Geschäftsadresse ändern', 'Alle Geschäftskontakte über neue Adresse informieren', 'nach_umzug', 'hoch', 'Gewerbe', -3, '{"is_self_employed": true}'),
('Arbeitsplatz einrichten', 'Home-Office in neuer Wohnung einrichten', 'nach_umzug', 'mittel', 'Arbeit', -30, '{"is_self_employed": true, "works_from_home": true}'),

-- Miet-spezifische Templates (property_type = "miete")
('Kaution übertragen', 'Kaution von alter zur neuen Wohnung übertragen', 'vor_umzug', 'hoch', 'Miete', 30, '{"property_type": "miete"}'),
('Übergabeprotokoll vorbereiten', 'Wohnungsübergabe dokumentieren', 'umzugstag', 'hoch', 'Miete', 0, '{"property_type": "miete"}'),
('Mietvertrag kündigen', 'Alte Wohnung fristgerecht kündigen', 'vor_umzug', 'hoch', 'Miete', 90, '{"property_type": "miete"}'),
('Hausordnung lesen', 'Hausordnung der neuen Wohnung durchlesen', 'nach_umzug', 'niedrig', 'Miete', -7, '{"property_type": "miete"}'),

-- Eigentums-spezifische Templates (property_type = "eigentum")
('Grundbuch eintragen lassen', 'Eigentumsübertragung im Grundbuch', 'vor_umzug', 'hoch', 'Eigentum', 60, '{"property_type": "eigentum"}'),
('Hausversicherung abschließen', 'Wohngebäudeversicherung für neues Haus', 'vor_umzug', 'hoch', 'Eigentum', 30, '{"property_type": "eigentum"}'),
('Grundsteuer anmelden', 'Grundsteuer bei neuer Gemeinde anmelden', 'nach_umzug', 'mittel', 'Eigentum', -30, '{"property_type": "eigentum"}'),

-- Garten-spezifische Templates (has_garden = true)
('Gartenpflege organisieren', 'Gärtner oder Gartengeräte für neuen Garten', 'nach_umzug', 'niedrig', 'Garten', -30, '{"has_garden": true}'),
('Pflanzen transportieren', 'Empfindliche Pflanzen sicher umziehen', 'umzugstag', 'mittel', 'Garten', 0, '{"has_garden": true}'),

-- Große Wohnung Templates (living_space >= 100)
('Heizkosten prüfen', 'Heizkosten für große Wohnung kalkulieren', 'vor_umzug', 'mittel', 'Kosten', 14, '{"living_space_min": 100}'),
('Reinigungshilfe organisieren', 'Professionelle Reinigung für große Wohnung', 'vor_umzug', 'niedrig', 'Service', 7, '{"living_space_min": 100}'),

-- Sammler/Viel-Besitz Templates (inventory_style = "collector")
('Lagermöglichkeiten prüfen', 'Zusätzlichen Stauraum für Sammlungen organisieren', 'vor_umzug', 'mittel', 'Lagerung', 21, '{"inventory_style": "collector"}'),
('Wertgegenstände versichern', 'Zusätzliche Versicherung für wertvolle Sammlungen', 'vor_umzug', 'mittel', 'Versicherung', 14, '{"inventory_style": "collector"}'),

-- DIY Umzug Templates (move_style = "diy")
('Umzugswagen reservieren', 'Transporter für Umzug mieten', 'vor_umzug', 'hoch', 'Transport', 14, '{"move_style": "diy"}'),
('Umzugshelfer organisieren', 'Freunde und Familie für Umzugshilfe anfragen', 'vor_umzug', 'hoch', 'Hilfe', 21, '{"move_style": "diy"}'),
('Umzugskartons besorgen', 'Ausreichend Kartons und Verpackungsmaterial kaufen', 'vor_umzug', 'hoch', 'Material', 14, '{"move_style": "diy"}'),

-- Umzugsfirma Templates (move_style = "company")
('Umzugsangebote einholen', 'Kostenvoranschläge von Umzugsfirmen vergleichen', 'vor_umzug', 'hoch', 'Service', 45, '{"move_style": "company"}'),
('Umzugsfirma beauftragen', 'Professionelle Umzugsfirma buchen', 'vor_umzug', 'hoch', 'Service', 30, '{"move_style": "company"}'),
('Haftung klären', 'Versicherungsschutz der Umzugsfirma prüfen', 'vor_umzug', 'mittel', 'Versicherung', 14, '{"move_style": "company"}');

-- Erweiterte Bedingungslogik-Funktion
CREATE OR REPLACE FUNCTION evaluate_task_conditions(
  conditions JSONB,
  household_data RECORD
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Wenn keine Bedingungen gesetzt sind, immer erfüllt
  IF conditions IS NULL OR conditions = '{}'::jsonb THEN
    RETURN TRUE;
  END IF;
  
  -- Kinder-Bedingungen
  IF conditions ? 'children_count_min' AND 
     household_data.children_count < (conditions->>'children_count_min')::integer THEN
    RETURN FALSE;
  END IF;
  
  -- Haustier-Bedingungen
  IF conditions ? 'pets_count_min' AND 
     household_data.pets_count < (conditions->>'pets_count_min')::integer THEN
    RETURN FALSE;
  END IF;
  
  -- Haustier-Typ-Bedingungen
  IF conditions ? 'pet_types' AND household_data.pet_types IS NOT NULL THEN
    -- Prüfe ob einer der geforderten Haustiertypen vorhanden ist
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(conditions->'pet_types') AS required_type
      WHERE household_data.pet_types ILIKE '%' || required_type || '%'
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Auto-Bedingungen
  IF conditions ? 'owns_car' AND 
     COALESCE(household_data.owns_car, false) != (conditions->>'owns_car')::boolean THEN
    RETURN FALSE;
  END IF;
  
  -- Selbstständigkeits-Bedingungen
  IF conditions ? 'is_self_employed' AND 
     COALESCE(household_data.is_self_employed, false) != (conditions->>'is_self_employed')::boolean THEN
    RETURN FALSE;
  END IF;
  
  -- Home-Office-Bedingungen
  IF conditions ? 'works_from_home' AND 
     COALESCE(household_data.works_from_home, false) != (conditions->>'works_from_home')::boolean THEN
    RETURN FALSE;
  END IF;
  
  -- Eigentumstyp-Bedingungen
  IF conditions ? 'property_type' AND 
     household_data.property_type::text != (conditions->>'property_type') THEN
    RETURN FALSE;
  END IF;
  
  -- Garten-Bedingungen
  IF conditions ? 'has_garden' AND 
     COALESCE(household_data.has_garden, false) != (conditions->>'has_garden')::boolean THEN
    RETURN FALSE;
  END IF;
  
  -- Wohnflächen-Bedingungen
  IF conditions ? 'living_space_min' AND 
     COALESCE(household_data.living_space, 0) < (conditions->>'living_space_min')::integer THEN
    RETURN FALSE;
  END IF;
  
  -- Inventar-Stil-Bedingungen
  IF conditions ? 'inventory_style' AND 
     household_data.inventory_style != (conditions->>'inventory_style') THEN
    RETURN FALSE;
  END IF;
  
  -- Umzugsstil-Bedingungen
  IF conditions ? 'move_style' AND 
     household_data.move_style != (conditions->>'move_style') THEN
    RETURN FALSE;
  END IF;
  
  -- Haushaltsgröße-Bedingungen
  IF conditions ? 'household_size_min' AND 
     household_data.household_size < (conditions->>'household_size_min')::integer THEN
    RETURN FALSE;
  END IF;
  
  IF conditions ? 'household_size_max' AND 
     household_data.household_size > (conditions->>'household_size_max')::integer THEN
    RETURN FALSE;
  END IF;
  
  -- Alle Bedingungen erfüllt
  RETURN TRUE;
END;
$$;

-- Erweiterte personalisierte Task-Erstellung
CREATE OR REPLACE FUNCTION create_personalized_tasks(p_household_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_record RECORD;
  household_record RECORD;
  task_count INTEGER := 0;
  calculated_due_date DATE;
  conditions_match BOOLEAN;
BEGIN
  -- Get household info
  SELECT * INTO household_record FROM public.households WHERE id = p_household_id;
  
  IF household_record IS NULL THEN
    RAISE EXCEPTION 'Household not found';
  END IF;
  
  -- Create tasks from templates based on conditions
  FOR template_record IN 
    SELECT * FROM public.checklist_templates 
    WHERE NOT EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE household_id = p_household_id 
      AND template_id = checklist_templates.id
    )
  LOOP
    -- Evaluate conditions
    SELECT evaluate_task_conditions(template_record.conditions, household_record) INTO conditions_match;
    
    -- Only create task if conditions are met
    IF conditions_match THEN
      -- Calculate due date
      calculated_due_date := household_record.move_date;
      IF template_record.days_before_move IS NOT NULL THEN
        calculated_due_date := household_record.move_date - INTERVAL '1 day' * template_record.days_before_move;
      END IF;
      
      -- Insert personalized task
      INSERT INTO public.tasks (
        household_id,
        title,
        description,
        phase,
        due_date,
        priority,
        category,
        template_id
      ) VALUES (
        p_household_id,
        template_record.title,
        template_record.description,
        template_record.phase,
        calculated_due_date,
        template_record.priority,
        template_record.category,
        template_record.id
      );
      
      task_count := task_count + 1;
    END IF;
  END LOOP;
  
  RETURN task_count;
END;
$$;

-- Update der ursprünglichen Funktion um die neue zu verwenden
CREATE OR REPLACE FUNCTION create_initial_tasks(p_household_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN create_personalized_tasks(p_household_id);
END;
$$;