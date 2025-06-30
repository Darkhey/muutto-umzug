/*
  # Timeline Module

  1. New Tables
    - `timeline_preferences` - Stores user preferences for timeline view
      - `id` (uuid, primary key)
      - `household_id` (uuid, references households)
      - `zoom_level` (text, 'week' or 'month')
      - `snap_to_grid` (boolean)
      - `show_modules` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `task_history` - Audit log for task date changes
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `changed_by` (uuid, references users)
      - `old_due_date` (date)
      - `new_due_date` (date)
      - `changed_at` (timestamp)
  
  2. Functions
    - `get_timeline(household_id)` - Gets all tasks for timeline view
    - `update_task_due_date(task_id, new_date)` - Updates task due date and logs change
  
  3. Security
    - Enable RLS on all tables
    - Add policies for household members
*/

-- Create timeline_preferences table
CREATE TABLE IF NOT EXISTS public.timeline_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  zoom_level TEXT NOT NULL DEFAULT 'month' CHECK (zoom_level IN ('week', 'month')),
  snap_to_grid BOOLEAN NOT NULL DEFAULT true,
  show_modules TEXT[] DEFAULT ARRAY['all'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id)
);

-- Create task_history table for audit
CREATE TABLE IF NOT EXISTS public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  old_due_date DATE,
  new_due_date DATE,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timeline_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for timeline_preferences
CREATE POLICY "Users can view timeline preferences for their households" 
  ON public.timeline_preferences FOR SELECT 
  USING (household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  ));

CREATE POLICY "Users can update timeline preferences for their households" 
  ON public.timeline_preferences FOR UPDATE 
  USING (household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  ));

CREATE POLICY "Users can insert timeline preferences for their households" 
  ON public.timeline_preferences FOR INSERT 
  WITH CHECK (household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
  ));

-- Create RLS policies for task_history
CREATE POLICY "Users can view task history for their households" 
  ON public.task_history FOR SELECT 
  USING (task_id IN (
    SELECT id FROM public.tasks 
    WHERE household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  ));

-- Create function to get timeline data
CREATE OR REPLACE FUNCTION public.get_timeline(p_household_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  phase TEXT,
  priority TEXT,
  category TEXT,
  due_date DATE,
  completed BOOLEAN,
  assigned_to UUID,
  assignee_name TEXT,
  is_overdue BOOLEAN,
  module_color TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.phase::TEXT,
    t.priority::TEXT,
    t.category,
    t.due_date,
    t.completed,
    t.assigned_to,
    m.name AS assignee_name,
    CASE WHEN t.due_date < CURRENT_DATE AND NOT t.completed THEN true ELSE false END AS is_overdue,
    CASE 
      WHEN t.phase = 'vor_umzug' THEN 'blue'
      WHEN t.phase = 'umzugstag' THEN 'green'
      WHEN t.phase = 'nach_umzug' THEN 'purple'
      WHEN t.phase = 'langzeit' THEN 'orange'
      ELSE 'gray'
    END AS module_color
  FROM 
    public.tasks t
  LEFT JOIN 
    public.household_members m ON t.assigned_to = m.id
  WHERE 
    t.household_id = p_household_id
  ORDER BY 
    t.due_date NULLS LAST, 
    t.priority DESC;
END;
$$;

-- Create function to update task due date
CREATE OR REPLACE FUNCTION public.update_task_due_date(
  p_task_id UUID,
  p_new_date DATE
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old_date DATE;
  v_household_id UUID;
BEGIN
  -- Check if user has access to this task
  SELECT t.household_id, t.due_date INTO v_household_id, v_old_date
  FROM public.tasks t
  WHERE t.id = p_task_id;
  
  IF v_household_id IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = v_household_id
    AND (user_id = auth.uid() OR (user_id IS NULL AND email = auth.email()))
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this task';
  END IF;
  
  -- Log the change in task_history
  INSERT INTO public.task_history (
    task_id,
    changed_by,
    old_due_date,
    new_due_date
  ) VALUES (
    p_task_id,
    auth.uid(),
    v_old_date,
    p_new_date
  );
  
  -- Update the task
  UPDATE public.tasks
  SET 
    due_date = p_new_date,
    updated_at = now()
  WHERE id = p_task_id;
  
  RETURN TRUE;
END;
$$;

-- Create trigger to update timeline_preferences.updated_at
CREATE OR REPLACE FUNCTION update_timeline_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timeline_preferences_updated_at
BEFORE UPDATE ON public.timeline_preferences
FOR EACH ROW EXECUTE FUNCTION update_timeline_preferences_updated_at();