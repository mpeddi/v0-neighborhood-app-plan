-- Fix RLS policies to allow authenticated users to see ALL posts
-- The _authenticated policies should allow viewing all posts, not just own posts

-- Help Requests: Allow authenticated users to see all posts
DROP POLICY IF EXISTS "help_requests_select_authenticated" ON help_requests;
CREATE POLICY "help_requests_select_authenticated" ON help_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Giveaways: Allow authenticated users to see all posts
DROP POLICY IF EXISTS "giveaways_select_authenticated" ON giveaways;
CREATE POLICY "giveaways_select_authenticated" ON giveaways
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Charitable Items: Allow authenticated users to see all posts
DROP POLICY IF EXISTS "charitable_items_select_authenticated" ON charitable_items;
CREATE POLICY "charitable_items_select_authenticated" ON charitable_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Community Comments: Allow authenticated users to see all comments
DROP POLICY IF EXISTS "community_comments_select_authenticated" ON community_comments;
CREATE POLICY "community_comments_select_authenticated" ON community_comments
  FOR SELECT
  USING (auth.role() = 'authenticated');
