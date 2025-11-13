-- Drop existing policy that grants viewers access to PII
DROP POLICY IF EXISTS "Officers can view persons" ON public.persons;

-- Recreate policy without viewer role access
CREATE POLICY "Officers can view persons" ON public.persons
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'officer'::app_role)
  );