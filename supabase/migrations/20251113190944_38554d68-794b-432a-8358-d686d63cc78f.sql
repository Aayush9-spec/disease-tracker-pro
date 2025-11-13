-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Create audit logging function for cases table
CREATE OR REPLACE FUNCTION public.log_case_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  action_type text;
  old_data jsonb;
  new_data jsonb;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'INSERT';
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Insert audit record
  INSERT INTO public.case_audits (case_id, changed_by, changed_at, diff)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    now(),
    jsonb_build_object(
      'action', action_type,
      'old_data', old_data,
      'new_data', new_data
    )
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- Create triggers for audit logging on cases table
DROP TRIGGER IF EXISTS audit_cases_insert ON public.cases;
CREATE TRIGGER audit_cases_insert
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.log_case_audit();

DROP TRIGGER IF EXISTS audit_cases_update ON public.cases;
CREATE TRIGGER audit_cases_update
  AFTER UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.log_case_audit();

DROP TRIGGER IF EXISTS audit_cases_delete ON public.cases;
CREATE TRIGGER audit_cases_delete
  AFTER DELETE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.log_case_audit();