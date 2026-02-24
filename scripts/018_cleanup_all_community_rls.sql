-- Comprehensive cleanup of all community table RLS policies
-- This script removes all conflicting policies and creates simple permissive ones

-- ======================
-- CHARITABLE_ITEMS TABLE
-- ======================
DROP POLICY IF EXISTS charitable_items_select_authenticated ON charitable_items;
DROP POLICY IF EXISTS charitable_items_select ON charitable_items;
DROP POLICY IF EXISTS charitable_items_insert_authenticated ON charitable_items;
DROP POLICY IF EXISTS charitable_items_insert ON charitable_items;
DROP POLICY IF EXISTS charitable_items_update_own ON charitable_items;
DROP POLICY IF EXISTS charitable_items_update ON charitable_items;
DROP POLICY IF EXISTS charitable_items_delete_own ON charitable_items;
DROP POLICY IF EXISTS charitable_items_delete ON charitable_items;

-- Simple SELECT for all authenticated users
CREATE POLICY charitable_items_select ON charitable_items
  FOR SELECT
  USING (true);

-- INSERT only for authenticated users creating their own items
CREATE POLICY charitable_items_insert ON charitable_items
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE own items
CREATE POLICY charitable_items_update_own ON charitable_items
  FOR UPDATE
  USING (auth.uid() = created_by);

-- DELETE own items
CREATE POLICY charitable_items_delete_own ON charitable_items
  FOR DELETE
  USING (auth.uid() = created_by);

-- ======================
-- GIVEAWAYS TABLE
-- ======================
DROP POLICY IF EXISTS giveaways_select_authenticated ON giveaways;
DROP POLICY IF EXISTS giveaways_select ON giveaways;
DROP POLICY IF EXISTS giveaways_insert_authenticated ON giveaways;
DROP POLICY IF EXISTS giveaways_insert ON giveaways;
DROP POLICY IF EXISTS giveaways_update_own_or_claimer ON giveaways;
DROP POLICY IF EXISTS giveaways_update ON giveaways;
DROP POLICY IF EXISTS giveaways_delete_own ON giveaways;
DROP POLICY IF EXISTS giveaways_delete ON giveaways;

-- Simple SELECT for all authenticated users
CREATE POLICY giveaways_select ON giveaways
  FOR SELECT
  USING (true);

-- INSERT only for authenticated users creating their own items
CREATE POLICY giveaways_insert ON giveaways
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE own giveaways
CREATE POLICY giveaways_update_own ON giveaways
  FOR UPDATE
  USING (auth.uid() = created_by);

-- DELETE own giveaways
CREATE POLICY giveaways_delete_own ON giveaways
  FOR DELETE
  USING (auth.uid() = created_by);

-- ======================
-- HELP_REQUESTS TABLE
-- ======================
DROP POLICY IF EXISTS help_requests_insert_authenticated ON help_requests;
DROP POLICY IF EXISTS help_requests_delete_own ON help_requests;
DROP POLICY IF EXISTS help_requests_insert ON help_requests;
DROP POLICY IF EXISTS help_requests_select ON help_requests;
DROP POLICY IF EXISTS help_requests_update ON help_requests;
DROP POLICY IF EXISTS help_requests_select_authenticated ON help_requests;
DROP POLICY IF EXISTS help_requests_delete ON help_requests;
DROP POLICY IF EXISTS help_requests_update_own ON help_requests;

-- Simple SELECT for all authenticated users
CREATE POLICY help_requests_select ON help_requests
  FOR SELECT
  USING (true);

-- INSERT only for authenticated users creating their own items
CREATE POLICY help_requests_insert ON help_requests
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE own requests
CREATE POLICY help_requests_update_own ON help_requests
  FOR UPDATE
  USING (auth.uid() = created_by);

-- DELETE own requests
CREATE POLICY help_requests_delete_own ON help_requests
  FOR DELETE
  USING (auth.uid() = created_by);
