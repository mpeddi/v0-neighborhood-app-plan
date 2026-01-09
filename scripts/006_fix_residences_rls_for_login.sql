-- Allow anonymous users to read residences for login verification
-- This is safe because residence information is intended to be visible to all neighbors

DROP POLICY IF EXISTS "residences_select_authenticated" ON residences;

-- Create new policy that allows both authenticated and anonymous users to read residences
CREATE POLICY "residences_select_all"
  ON residences
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Keep the update policy for authenticated users only
-- (already exists as residences_update_own)
