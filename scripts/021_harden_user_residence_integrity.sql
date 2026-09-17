-- Keep residence claim state derived from authenticated profile links.
UPDATE public.residences r
SET is_claimed = EXISTS (
  SELECT 1
  FROM public.users u
  WHERE u.residence_id = r.id
);

CREATE OR REPLACE FUNCTION public.sync_residence_claimed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.residence_id IS DISTINCT FROM NEW.residence_id) THEN
    UPDATE public.residences
    SET is_claimed = EXISTS (
      SELECT 1 FROM public.users WHERE residence_id = OLD.residence_id
    )
    WHERE id = OLD.residence_id;
  END IF;

  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.residence_id IS DISTINCT FROM NEW.residence_id) THEN
    UPDATE public.residences
    SET is_claimed = TRUE
    WHERE id = NEW.residence_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_residence_claimed_on_user_change ON public.users;
CREATE TRIGGER sync_residence_claimed_on_user_change
AFTER INSERT OR UPDATE OF residence_id OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.sync_residence_claimed();

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

REVOKE ALL ON FUNCTION public.sync_residence_claimed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_residence_claimed() TO postgres;
