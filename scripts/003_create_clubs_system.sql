-- Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create club_members join table
CREATE TABLE IF NOT EXISTS public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Create club_posts table
CREATE TABLE IF NOT EXISTS public.club_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  post_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create club_post_comments table
CREATE TABLE IF NOT EXISTS public.club_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.club_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_post_comments ENABLE ROW LEVEL SECURITY;

-- Clubs policies (all can view, authenticated can create)
CREATE POLICY "clubs_select_authenticated"
  ON public.clubs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clubs_insert_authenticated"
  ON public.clubs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Club members policies
CREATE POLICY "club_members_select_authenticated"
  ON public.club_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "club_members_insert_own"
  ON public.club_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "club_members_delete_own"
  ON public.club_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Club posts policies
CREATE POLICY "club_posts_select_authenticated"
  ON public.club_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "club_posts_insert_authenticated"
  ON public.club_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "club_posts_update_own"
  ON public.club_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "club_posts_delete_own"
  ON public.club_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Club post comments policies
CREATE POLICY "club_post_comments_select_authenticated"
  ON public.club_post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "club_post_comments_insert_authenticated"
  ON public.club_post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "club_post_comments_delete_own"
  ON public.club_post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Pre-populate with Garden Club and Book Club
INSERT INTO public.clubs (name, description) VALUES
  ('Garden Club', 'Share plants, flowers, and gardening tips with neighbors'),
  ('Book Club', 'Read and discuss books together as a neighborhood');
