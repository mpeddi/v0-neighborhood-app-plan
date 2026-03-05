-- Add onboarding_completed flag to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update existing users without phone numbers to have onboarding_completed = false
UPDATE public.users 
SET onboarding_completed = false 
WHERE phone_number IS NULL OR phone_number = '';

-- Update existing users with phone numbers to have onboarding_completed = true
UPDATE public.users 
SET onboarding_completed = true 
WHERE phone_number IS NOT NULL AND phone_number != '';
