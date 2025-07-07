/*
  # Timeline Module
  Add timeline_preferences and task_history tables with RLS
  and trigger to log due_date changes on tasks.
*/

-- Table to store user UI preferences for the timeline
CREATE TABLE IF NOT EXISTS public.timeline_preferences (
  household_id uuid PRIMARY KEY REFERENCES public.households(id) ON DELETE CASCADE,
  zoom_level   text NOT NULL DEFAULT 'month' CHECK (zoom_level IN ('week', 'month')),
  snap_to_grid boolean NOT NULL DEFAULT true,
  show_modules text[] NOT NULL DEFAULT '{}'::text[]
);

-- Table to audit task due_date changes
CREATE TABLE IF NOT EXISTS public.task_history (
  id         bigserial PRIMARY KEY,
  task_id    uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- may be NULL for automated updates
  old_due    date NOT NULL,
  new_due    date NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON public.task_history (task_id);

-- Trigger function to log due_date changes
CREATE OR REPLACE FUNCTION public.log_due_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.due_date IS DISTINCT FROM OLD.due_date THEN
    INSERT INTO public.task_history(task_id, changed_by, old_due, new_due)
    VALUES (NEW.id, auth.uid(), OLD.due_date, NEW.due_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_due
AFTER UPDATE OF due_date ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.log_due_change();

-- Enable RLS
ALTER TABLE public.timeline_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Allow household members to view and update their timeline preferences
CREATE POLICY "Timeline prefs read" ON public.timeline_preferences
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Timeline prefs modify" ON public.timeline_preferences
  FOR UPDATE USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    household_id = OLD.household_id AND
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Timeline prefs insert" ON public.timeline_preferences
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Timeline prefs delete" ON public.timeline_preferences
  FOR DELETE USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow household members to read task history
CREATE POLICY "Task history read" ON public.task_history
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE household_id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid()
      )
    )
  );
CREATE POLICY "Task history no client insert" ON public.task_history
  FOR INSERT WITH CHECK (false);
