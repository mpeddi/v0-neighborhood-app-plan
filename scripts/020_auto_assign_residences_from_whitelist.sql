-- Fix existing whitelisted users who should have residences
UPDATE public.users
SET residence_id = ae.residence_id
FROM public.allowed_emails ae
WHERE users.email = ae.email
  AND users.residence_id IS NULL
  AND ae.residence_id IS NOT NULL;

-- Log the migration
SELECT COUNT(*) as users_updated FROM public.users
WHERE residence_id IS NOT NULL AND email IN (SELECT email FROM public.allowed_emails WHERE residence_id IS NOT NULL);
