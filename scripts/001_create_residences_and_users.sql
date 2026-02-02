-- Create residences table with pre-populated Morris Township neighborhood data
CREATE TABLE IF NOT EXISTS public.residences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  street_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  additional_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table linked to auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  residence_id UUID REFERENCES public.residences(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for residences (all verified users can view all residences)
CREATE POLICY "residences_select_authenticated"
  ON public.residences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "residences_update_own"
  ON public.residences FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT residence_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "residences_delete_authenticated"
  ON public.residences FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for users (users can view all, update only own)
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Pre-populate residences with Morris Township neighborhood data
-- Symor Dr
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('14 Symor Dr', 'Symor Dr', 'Thompson', '862-345-7878'),
  ('16 Symor Dr', 'Symor Dr', 'Martinez', '973-555-0101'),
  ('18 Symor Dr', 'Symor Dr', 'Johnson', '973-555-0102'),
  ('20 Symor Dr', 'Symor Dr', 'Williams', '973-555-0103'),
  ('22 Symor Dr', 'Symor Dr', 'Brown', '973-555-0104'),
  ('24 Symor Dr', 'Symor Dr', 'Davis', '973-555-0105'),
  ('26 Symor Dr', 'Symor Dr', 'Miller', '973-555-0106'),
  ('28 Symor Dr', 'Symor Dr', 'Wilson', '973-555-0107'),
  ('30 Symor Dr', 'Symor Dr', 'Moore', '973-555-0108'),
  ('32 Symor Dr', 'Symor Dr', 'Taylor', '973-555-0109');

-- Brothers Pl
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('1 Brothers Pl', 'Brothers Pl', 'Anderson', '973-555-0201'),
  ('3 Brothers Pl', 'Brothers Pl', 'Thomas', '973-555-0202'),
  ('5 Brothers Pl', 'Brothers Pl', 'Jackson', '973-555-0203'),
  ('7 Brothers Pl', 'Brothers Pl', 'White', '973-555-0204'),
  ('9 Brothers Pl', 'Brothers Pl', 'Harris', '973-555-0205'),
  ('11 Brothers Pl', 'Brothers Pl', 'Martin', '973-555-0206'),
  ('13 Brothers Pl', 'Brothers Pl', 'Garcia', '973-555-0207'),
  ('15 Brothers Pl', 'Brothers Pl', 'Rodriguez', '973-555-0208');

-- Fanok Rd
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('5 Fanok Rd', 'Fanok Rd', 'Lee', '973-555-0301'),
  ('7 Fanok Rd', 'Fanok Rd', 'Walker', '973-555-0302'),
  ('9 Fanok Rd', 'Fanok Rd', 'Hall', '973-555-0303'),
  ('11 Fanok Rd', 'Fanok Rd', 'Allen', '973-555-0304'),
  ('13 Fanok Rd', 'Fanok Rd', 'Young', '973-555-0305'),
  ('15 Fanok Rd', 'Fanok Rd', 'King', '973-555-0306'),
  ('17 Fanok Rd', 'Fanok Rd', 'Wright', '973-555-0307'),
  ('19 Fanok Rd', 'Fanok Rd', 'Lopez', '973-555-0308'),
  ('21 Fanok Rd', 'Fanok Rd', 'Hill', '973-555-0309'),
  ('23 Fanok Rd', 'Fanok Rd', 'Scott', '973-555-0310');

-- Hadley Way
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('2 Hadley Way', 'Hadley Way', 'Green', '973-555-0401'),
  ('4 Hadley Way', 'Hadley Way', 'Adams', '973-555-0402'),
  ('6 Hadley Way', 'Hadley Way', 'Baker', '973-555-0403'),
  ('8 Hadley Way', 'Hadley Way', 'Nelson', '973-555-0404'),
  ('10 Hadley Way', 'Hadley Way', 'Carter', '973-555-0405'),
  ('12 Hadley Way', 'Hadley Way', 'Mitchell', '973-555-0406'),
  ('14 Hadley Way', 'Hadley Way', 'Roberts', '973-555-0407'),
  ('16 Hadley Way', 'Hadley Way', 'Turner', '973-555-0408');

-- Herms Pl
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('10 Herms Pl', 'Herms Pl', 'Phillips', '973-555-0501'),
  ('12 Herms Pl', 'Herms Pl', 'Campbell', '973-555-0502'),
  ('14 Herms Pl', 'Herms Pl', 'Parker', '973-555-0503'),
  ('16 Herms Pl', 'Herms Pl', 'Evans', '973-555-0504'),
  ('18 Herms Pl', 'Herms Pl', 'Edwards', '973-555-0505'),
  ('20 Herms Pl', 'Herms Pl', 'Collins', '973-555-0506'),
  ('22 Herms Pl', 'Herms Pl', 'Stewart', '973-555-0507'),
  ('24 Herms Pl', 'Herms Pl', 'Morris', '973-555-0508'),
  ('26 Herms Pl', 'Herms Pl', 'Rogers', '973-555-0509');
