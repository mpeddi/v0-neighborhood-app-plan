-- Prevent a caller from moving their profile onto another user's identity.
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Residence deletion is administrative data management, not a user capability.
DROP POLICY IF EXISTS "residences_delete_authenticated" ON public.residences;
CREATE POLICY "residences_delete_admin"
  ON public.residences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
        AND users.is_admin = TRUE
    )
  );

GRANT EXECUTE ON FUNCTION public.sync_residence_claimed() TO postgres;
