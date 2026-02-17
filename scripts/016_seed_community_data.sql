-- Seed sample data for community features
-- This script adds test data to help_requests, giveaways, and charitable_items tables

-- First, get a user ID from the users table to use as creator
-- We'll use a CTE to get the first user, or create test data

-- Insert sample help requests
INSERT INTO help_requests (id, created_by, title, description, request_type, status, created_at)
SELECT 
  gen_random_uuid(),
  u.id,
  'Need help with yard work',
  'Looking for someone to help with yard cleanup this weekend',
  'labor',
  'open',
  now()
FROM users u LIMIT 1
UNION ALL
SELECT 
  gen_random_uuid(),
  u.id,
  'Plumbing repair needed',
  'Kitchen sink is leaking, need a plumber recommendation',
  'repair',
  'open',
  now()
FROM users u LIMIT 1 OFFSET 1
UNION ALL
SELECT 
  gen_random_uuid(),
  u.id,
  'Lost cat',
  'Orange tabby cat missing since yesterday',
  'other',
  'open',
  now()
FROM users u LIMIT 1 OFFSET 2
ON CONFLICT DO NOTHING;

-- Insert sample giveaways
INSERT INTO giveaways (id, created_by, title, description, status, created_at)
SELECT 
  gen_random_uuid(),
  u.id,
  'Free coffee maker',
  'Working Keurig coffee maker, moving and need to downsize',
  'available',
  now()
FROM users u LIMIT 1
UNION ALL
SELECT 
  gen_random_uuid(),
  u.id,
  'Books for kids',
  'Collection of children books ages 5-10, great condition',
  'available',
  now()
FROM users u LIMIT 1 OFFSET 1
UNION ALL
SELECT 
  gen_random_uuid(),
  u.id,
  'Bicycle',
  'Adult mountain bike, well maintained',
  'available',
  now()
FROM users u LIMIT 1 OFFSET 2
ON CONFLICT DO NOTHING;

-- Insert sample charitable items
INSERT INTO charitable_items (id, created_by, title, description, item_type, status, created_at)
SELECT 
  gen_random_uuid(),
  u.id,
  'Winter coats drive',
  'Collecting gently used winter coats for families in need',
  'donation_drive',
  'active',
  now()
FROM users u LIMIT 1
UNION ALL
SELECT 
  gen_random_uuid(),
  u.id,
  'Food pantry items needed',
  'Accepting canned goods and non-perishables',
  'request',
  'active',
  now()
FROM users u LIMIT 1 OFFSET 1
UNION ALL
SELECT 
  gen_random_uuid(),
  u.id,
  'School supplies collection',
  'Gathering supplies for underprivileged students',
  'donation_drive',
  'active',
  now()
FROM users u LIMIT 1 OFFSET 2
ON CONFLICT DO NOTHING;
