-- Create audit_logs table to track all admin actions
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  resource_type VARCHAR(50) NOT NULL, -- 'residence', 'club', 'event', etc.
  resource_id UUID NOT NULL,
  old_values JSONB, -- For updates, the previous values
  new_values JSONB, -- For updates, the new values
  description TEXT, -- Human-readable description of the change
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET, -- Optional: client IP if available
  user_agent TEXT -- Optional: user agent string
);

-- Create index for common queries
CREATE INDEX audit_logs_admin_id_idx ON public.audit_logs(admin_id);
CREATE INDEX audit_logs_resource_type_idx ON public.audit_logs(resource_type);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs(created_at);
CREATE INDEX audit_logs_resource_id_idx ON public.audit_logs(resource_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "audit_logs_view_admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only service role can insert (via server actions)
CREATE POLICY "audit_logs_insert_service"
  ON public.audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
