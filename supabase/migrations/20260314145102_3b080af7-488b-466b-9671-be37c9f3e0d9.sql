
-- Community discussion posts
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  replies_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Replies to community posts (threaded)
CREATE TABLE public.community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Likes for community posts and replies
CREATE TABLE public.community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('post', 'reply')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- community_posts policies
CREATE POLICY "Community posts viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Members can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- community_replies policies
CREATE POLICY "Replies viewable by everyone" ON public.community_replies FOR SELECT USING (true);
CREATE POLICY "Members can reply" ON public.community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete own replies" ON public.community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- community_likes policies
CREATE POLICY "Likes viewable by everyone" ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
