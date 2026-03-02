-- Check onboarding flow state for all users
-- This shows if auth trigger worked, residences are assigned, and onboarding logic

SELECT 
  u.id,
  u.email,
  u.phone_number,
  CASE 
    WHEN u.phone_number IS NOT NULL AND u.phone_number != '' THEN 'COMPLETED'
    ELSE 'NEEDS_ONBOARDING'
  END as onboarding_status,
  u.residence_id,
  r.address,
  r.last_name,
  ae.residence_id as whitelist_residence_id,
  u.created_at,
  u.is_admin
FROM users u
LEFT JOIN residences r ON u.residence_id = r.id
LEFT JOIN allowed_emails ae ON LOWER(u.email) = LOWER(ae.email)
ORDER BY u.created_at DESC
LIMIT 20;
