-- Add DELETE RLS policies for community tables and clubs (if they don't already exist)
-- These policies allow users to delete their own content and allow admins to delete any content

-- Clubs DELETE policy - allow creators and admins to delete
-- Drop and recreate to ensure consistency
DROP POLICY IF EXISTS "clubs_delete_own" ON public.clubs;
CREATE POLICY "clubs_delete_own"
  ON public.clubs FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Giveaways DELETE policy - allow creators and admins to delete
-- Drop and recreate to ensure consistency
DROP POLICY IF EXISTS "giveaways_delete_own" ON public.giveaways;
CREATE POLICY "giveaways_delete_own"
  ON public.giveaways FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Help requests DELETE policy - allow creators and admins to delete
-- Drop and recreate to ensure consistency
DROP POLICY IF EXISTS "help_requests_delete_own" ON public.help_requests;
CREATE POLICY "help_requests_delete_own"
  ON public.help_requests FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Charitable items DELETE policy - allow creators and admins to delete
-- Drop and recreate to ensure consistency
DROP POLICY IF EXISTS "charitable_items_delete_own" ON public.charitable_items;
CREATE POLICY "charitable_items_delete_own"
  ON public.charitable_items FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
