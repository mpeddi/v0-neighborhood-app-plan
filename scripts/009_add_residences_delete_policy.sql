-- Add DELETE policy for residences table to allow admins to delete residences
CREATE POLICY "residences_delete_authenticated"
  ON public.residences FOR DELETE
  TO authenticated
  USING (true);
