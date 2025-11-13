-- Enable realtime for cases table
ALTER TABLE public.cases REPLICA IDENTITY FULL;

-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'case_added', 'case_updated', 'alert'
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Officers and admins can create notifications
CREATE POLICY "Officers can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'officer'::app_role)
  );

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create activity log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'case', 'disease', 'user'
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Everyone can view activity logs
CREATE POLICY "Everyone can view activity" ON public.activity_log
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'officer'::app_role) OR 
    public.has_role(auth.uid(), 'viewer'::app_role)
  );

-- Officers can create activity logs
CREATE POLICY "Officers can create activity" ON public.activity_log
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'officer'::app_role)
  );

-- Enable realtime for activity_log
ALTER TABLE public.activity_log REPLICA IDENTITY FULL;

-- Function to create notification on new case
CREATE OR REPLACE FUNCTION notify_new_case()
RETURNS TRIGGER AS $$
DECLARE
  disease_name TEXT;
  user_record RECORD;
BEGIN
  -- Get disease name
  SELECT name INTO disease_name FROM public.diseases WHERE id = NEW.disease_id;
  
  -- Create notifications for all officers and admins
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.user_roles 
    WHERE role IN ('admin', 'officer')
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, case_id)
    VALUES (
      user_record.user_id,
      'New Case Reported',
      'A new ' || disease_name || ' case has been reported with ' || COALESCE(NEW.severity::TEXT, 'unknown') || ' severity',
      'case_added',
      NEW.id
    );
  END LOOP;
  
  -- Log activity
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'created',
    'case',
    NEW.id,
    jsonb_build_object(
      'disease', disease_name,
      'severity', NEW.severity,
      'confirmed', NEW.confirmed
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new cases
CREATE TRIGGER on_case_created
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_case();