
-- Create premium_content table
CREATE TABLE public.premium_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.companion_models(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL DEFAULT '',
  preview_url TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  requires_model_subscription BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view (VIP gating is done in app)
CREATE POLICY "Authenticated users can view premium content"
ON public.premium_content FOR SELECT TO authenticated
USING (true);

-- Admins/Devs can manage
CREATE POLICY "Admins can manage premium content"
ON public.premium_content FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Developers can manage premium content"
ON public.premium_content FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

-- Create content_unlocks table to track user purchases
CREATE TABLE public.content_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.premium_content(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE public.content_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks"
ON public.content_unlocks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocks"
ON public.content_unlocks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage unlocks"
ON public.content_unlocks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Developers can manage unlocks"
ON public.content_unlocks FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

-- Storage bucket for premium content
INSERT INTO storage.buckets (id, name, public) VALUES ('premium-content', 'premium-content', true);

CREATE POLICY "Anyone can view premium content files"
ON storage.objects FOR SELECT
USING (bucket_id = 'premium-content');

CREATE POLICY "Admins can upload premium content"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'premium-content' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'developer'::app_role)));

CREATE POLICY "Admins can delete premium content"
ON storage.objects FOR DELETE
USING (bucket_id = 'premium-content' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'developer'::app_role)));

-- Trigger for updated_at
CREATE TRIGGER update_premium_content_updated_at
BEFORE UPDATE ON public.premium_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
