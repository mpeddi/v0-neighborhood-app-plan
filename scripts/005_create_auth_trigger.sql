-- Create function to auto-create user profile when auth user is created
-- And automatically assign residence from whitelist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  whitelisted_residence_id UUID;
BEGIN
  -- Look up the residence from allowed_emails
  SELECT residence_id INTO whitelisted_residence_id
  FROM public.allowed_emails
  WHERE LOWER(email) = LOWER(new.email)
  LIMIT 1;
  
  INSERT INTO public.users (id, phone_number, email, is_admin, residence_id, onboarding_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'phone_number', ''),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'is_admin')::BOOLEAN, false),
    whitelisted_residence_id,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
