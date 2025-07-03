-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN has_children BOOLEAN,
ADD COLUMN has_pets BOOLEAN,
ADD COLUMN owns_car BOOLEAN,
ADD COLUMN is_self_employed BOOLEAN,
ADD COLUMN wants_notifications BOOLEAN;

-- Add new columns to checklist_templates table
ALTER TABLE public.checklist_templates
ADD COLUMN required_documents JSONB,
ADD COLUMN online_form_link TEXT,
ADD COLUMN zuständige_stelle TEXT,
ADD COLUMN opening_hours TEXT,
ADD COLUMN source_reference TEXT;

-- Optional: Add constraints for data integrity
ALTER TABLE public.checklist_templates
ADD CONSTRAINT valid_online_form_link 
CHECK (online_form_link IS NULL OR online_form_link ~* '^https?://.*');

-- Optional: Add index for performance if needed
CREATE INDEX IF NOT EXISTS idx_checklist_templates_online_form_link 
ON public.checklist_templates(online_form_link) 
WHERE online_form_link IS NOT NULL;
