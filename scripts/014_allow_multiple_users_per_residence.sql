-- Migration: Remove is_claimed constraint to allow multiple people per residence
-- This allows spouses, roommates, and other household members to all claim the same residence

-- Drop the is_claimed column since it's no longer needed
-- We'll check if a residence is claimed by checking if ANY user has that residence_id
ALTER TABLE public.residences DROP COLUMN IF EXISTS is_claimed;

-- No RLS changes needed - the existing policies already support multiple users per residence
-- The key is that the claimResidence application logic will now allow multiple claims
