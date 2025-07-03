ALTER TABLE public.households
ADD CONSTRAINT households_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
