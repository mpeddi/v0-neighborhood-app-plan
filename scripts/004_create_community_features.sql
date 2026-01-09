-- Create charitable_items table
CREATE TABLE IF NOT EXISTS public.charitable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('drive', 'need')),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create giveaways table
CREATE TABLE IF NOT EXISTS public.giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed')),
  claimed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create help_requests table
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  request_type TEXT NOT NULL CHECK (request_type IN ('help', 'advice')),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table for community features
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('charitable', 'giveaway', 'help_request')),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.charitable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Charitable items policies
CREATE POLICY "charitable_items_select_authenticated"
  ON public.charitable_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "charitable_items_insert_authenticated"
  ON public.charitable_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "charitable_items_update_own"
  ON public.charitable_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "charitable_items_delete_own"
  ON public.charitable_items FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Giveaways policies
CREATE POLICY "giveaways_select_authenticated"
  ON public.giveaways FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "giveaways_insert_authenticated"
  ON public.giveaways FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "giveaways_update_own_or_claimer"
  ON public.giveaways FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = claimed_by);

CREATE POLICY "giveaways_delete_own"
  ON public.giveaways FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Help requests policies
CREATE POLICY "help_requests_select_authenticated"
  ON public.help_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "help_requests_insert_authenticated"
  ON public.help_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "help_requests_update_own"
  ON public.help_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "help_requests_delete_own"
  ON public.help_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Community comments policies
CREATE POLICY "community_comments_select_authenticated"
  ON public.community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "community_comments_insert_authenticated"
  ON public.community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_comments_delete_own"
  ON public.community_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
