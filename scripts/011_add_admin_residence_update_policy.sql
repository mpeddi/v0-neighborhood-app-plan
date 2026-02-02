-- Add UPDATE RLS policy for admins to update any residence (including unclaimed ones)
-- This allows admins to edit residence names before they are claimed

-- First, we need a way to check if a user is an admin
-- The users table should have is_admin column, so we check that

CREATE POLICY "residences_update_admin"
  ON public.residences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    )
  );
