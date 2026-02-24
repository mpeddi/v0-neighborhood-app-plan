-- Drop all existing RLS policies on community_comments
DROP POLICY IF EXISTS community_comments_select_authenticated ON community_comments;
DROP POLICY IF EXISTS community_comments_select ON community_comments;
DROP POLICY IF EXISTS community_comments_insert ON community_comments;
DROP POLICY IF EXISTS community_comments_update ON community_comments;
DROP POLICY IF EXISTS community_comments_delete ON community_comments;
DROP POLICY IF EXISTS community_comments_delete_own ON community_comments;
DROP POLICY IF EXISTS community_comments_insert_authenticated ON community_comments;

-- Create simple, clean RLS policies for community_comments

-- SELECT: Allow all authenticated users to read all comments
CREATE POLICY community_comments_select ON community_comments
  FOR SELECT
  USING (true);

-- INSERT: Only the creator can insert comments
CREATE POLICY community_comments_insert ON community_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only the creator can update their comments
CREATE POLICY community_comments_update ON community_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only the creator can delete their comments (or admins)
CREATE POLICY community_comments_delete ON community_comments
  FOR DELETE
  USING (auth.uid() = user_id OR EXISTS(
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
  ));
