-- Fix RLS SELECT policies to allow all authenticated users to read community items
-- The issue is that items are being created but not visible due to overly restrictive RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS charitable_items_select ON charitable_items;
DROP POLICY IF EXISTS giveaways_select ON giveaways;
DROP POLICY IF EXISTS help_requests_select ON help_requests;

-- Create new permissive SELECT policies for authenticated users
CREATE POLICY charitable_items_select ON charitable_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY giveaways_select ON giveaways
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY help_requests_select ON help_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Also ensure INSERT policies exist and are permissive
DROP POLICY IF EXISTS charitable_items_insert ON charitable_items;
DROP POLICY IF EXISTS giveaways_insert ON giveaways;
DROP POLICY IF EXISTS help_requests_insert ON help_requests;

CREATE POLICY charitable_items_insert ON charitable_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY giveaways_insert ON giveaways
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY help_requests_insert ON help_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);
