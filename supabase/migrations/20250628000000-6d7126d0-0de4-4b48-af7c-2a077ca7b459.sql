-- Migration to add tasks and checklist_templates tables

-- Enums for tasks
CREATE TYPE public.task_phase AS ENUM ('vor_umzug', 'umzugstag', 'nach_umzug', 'langzeit');
CREATE TYPE public.task_priority AS ENUM ('niedrig', 'mittel', 'hoch', 'kritisch');

-- Checklist templates table
CREATE TABLE public.checklist_templates (
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
CREATE TABLE public.tasks (
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

