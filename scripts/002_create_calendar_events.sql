-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  category TEXT DEFAULT 'Social',
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view events
CREATE POLICY "events_select_authenticated"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create events
CREATE POLICY "events_insert_authenticated"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only creator or admin can update
CREATE POLICY "events_update_own_or_admin"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );

-- Only creator or admin can delete
CREATE POLICY "events_delete_own_or_admin"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );
