
-- Badges definition table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  criteria_type text NOT NULL,
  criteria_value int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Hobby checklist items per user
CREATE TABLE public.hobby_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_key text NOT NULL,
  item_label text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_key)
);

-- RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobby_checklist ENABLE ROW LEVEL SECURITY;

-- Badges readable by all
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User badges
CREATE POLICY "User badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Hobby checklist
CREATE POLICY "Users can view own checklist" ON public.hobby_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist" ON public.hobby_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist" ON public.hobby_checklist FOR UPDATE USING (auth.uid() = user_id);

-- Seed the three badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value) VALUES
  ('Curious Soul', 'Complete the hobby quiz', '🔮', 'quiz_complete', 1),
  ('Explorer', 'Follow 3 different hobbies', '🧭', 'hobbies_followed', 3),
  ('Consistent', 'Create 5 posts', '🔥', 'posts_created', 5);
