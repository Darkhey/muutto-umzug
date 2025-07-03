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
