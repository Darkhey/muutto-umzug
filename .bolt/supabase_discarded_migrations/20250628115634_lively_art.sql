/*
  # Aufgaben- und Template-System

  1. Neue Enums
    - `task_phase` - Umzugsphasen
    - `task_priority` - Aufgabenpriorität
  
  2. Neue Tabellen
    - `checklist_templates` - Vordefinierte Aufgabenvorlagen
    - `tasks` - Konkrete Aufgaben pro Haushalt
  
  3. Sicherheit
    - RLS für alle neuen Tabellen
    - Sichere Policies für Aufgabenverwaltung
  
  4. Funktionen
    - `create_initial_tasks` - Erstellt Aufgaben aus Vorlagen
*/

-- Enums for tasks
CREATE TYPE public.task_phase AS ENUM ('vor_umzug', 'umzugstag', 'nach_umzug', 'langzeit');
CREATE TYPE public.task_priority AS ENUM ('niedrig', 'mittel', 'hoch', 'kritisch');

-- Checklist templates table
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phase task_phase NOT NULL,
  assigned_role household_role,
  days_before_move INTEGER,
  priority task_priority NOT NULL DEFAULT 'mittel',
  category TEXT,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  phase task_phase NOT NULL,
  assigned_to UUID REFERENCES public.household_members,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users,
  priority task_priority NOT NULL DEFAULT 'mittel',
  category TEXT,
  template_id UUID REFERENCES public.checklist_templates,
  dependencies UUID[],
  estimated_duration INTEGER,
  actual_duration INTEGER,
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for checklist_templates (read-only for all authenticated users)
CREATE POLICY "All users can view templates"
  ON public.checklist_templates FOR SELECT
  TO authenticated
  USING (true);

-- Policies for tasks
CREATE POLICY "Users can view tasks of their households"
  ON public.tasks FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  );

CREATE POLICY "Assigned users can update their tasks"
  ON public.tasks FOR UPDATE
  USING (assigned_to IN (
    SELECT id FROM public.household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Household owners can manage all tasks"
  ON public.tasks FOR ALL
  USING (
    household_id IN (
      SELECT id FROM public.households WHERE created_by = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_household_status ON public.tasks(household_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_household_due_date ON public.tasks(household_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_household_members_lookup ON public.household_members(household_id, user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_email ON public.household_members(email);

-- Function to create initial tasks from templates
CREATE OR REPLACE FUNCTION create_initial_tasks(p_household_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_record RECORD;
  household_record RECORD;
  task_count INTEGER := 0;
  calculated_due_date DATE;
BEGIN
  -- Get household info
  SELECT move_date INTO household_record FROM public.households WHERE id = p_household_id;
  
  IF household_record IS NULL THEN
    RAISE EXCEPTION 'Household not found';
  END IF;
  
  -- Create tasks from templates
  FOR template_record IN 
    SELECT * FROM public.checklist_templates 
    WHERE NOT EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE household_id = p_household_id 
      AND template_id = checklist_templates.id
    )
  LOOP
    -- Calculate due date
    calculated_due_date := household_record.move_date;
    IF template_record.days_before_move IS NOT NULL THEN
      calculated_due_date := household_record.move_date - INTERVAL '1 day' * template_record.days_before_move;
    END IF;
    
    -- Insert task
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
  END LOOP;
  
  RETURN task_count;
END;
$$;

-- Insert default templates
INSERT INTO public.checklist_templates (title, description, phase, assigned_role, days_before_move, priority, category) VALUES
('Mietvertrag kündigen', 'Kündigungsschreiben für die alte Wohnung aufsetzen und versenden', 'vor_umzug', 'vertragsmanager', 90, 'hoch', 'Verträge'),
('Umzugsunternehmen beauftragen', 'Angebote einholen und Umzugsunternehmen buchen', 'vor_umzug', 'packbeauftragte', 60, 'hoch', 'Organisation'),
('Kartons besorgen', 'Ausreichend Umzugskartons und Verpackungsmaterial kaufen', 'vor_umzug', 'packbeauftragte', 30, 'mittel', 'Material'),
('Strom ummelden', 'Stromanbieter über Umzug informieren oder neuen Anbieter beauftragen', 'vor_umzug', 'vertragsmanager', 14, 'hoch', 'Verträge'),
('Internet ummelden', 'Internetanschluss für neue Wohnung beantragen', 'vor_umzug', 'vertragsmanager', 30, 'hoch', 'Verträge'),
('Adresse bei Banken ändern', 'Neue Adresse bei allen Banken und Versicherungen hinterlegen', 'nach_umzug', 'finanzperson', -7, 'mittel', 'Ummeldungen'),
('Einwohnermeldeamt ummelden', 'Adressänderung beim örtlichen Einwohnermeldeamt', 'nach_umzug', NULL, -14, 'kritisch', 'Behörden'),
('Haustiere ummelden', 'Haustiere bei der neuen Gemeinde anmelden', 'nach_umzug', 'haustierverantwortliche', -30, 'mittel', 'Haustiere'),
('Kaution zurückfordern', 'Kautionsrückzahlung bei altem Vermieter beantragen', 'langzeit', 'finanzperson', -90, 'mittel', 'Finanzen'),
('Renovierungsarbeiten planen', 'Schönheitsreparaturen in der neuen Wohnung koordinieren', 'vor_umzug', 'renovierer', 21, 'niedrig', 'Renovierung')
ON CONFLICT DO NOTHING;