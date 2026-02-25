
-- Create user_characters table for user-created AI characters
CREATE TABLE public.user_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  personality_prompt TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'friendly',
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_characters ENABLE ROW LEVEL SECURITY;

-- Users can view their own characters
CREATE POLICY "Users can view own characters"
ON public.user_characters FOR SELECT
USING (auth.uid() = user_id);

-- Users can view public characters
CREATE POLICY "Users can view public characters"
ON public.user_characters FOR SELECT
USING (is_public = true);

-- Users can create their own characters
CREATE POLICY "Users can create own characters"
ON public.user_characters FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own characters
CREATE POLICY "Users can update own characters"
ON public.user_characters FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own characters
CREATE POLICY "Users can delete own characters"
ON public.user_characters FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all characters
CREATE POLICY "Admins can manage characters"
ON public.user_characters FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Developers can manage all characters
CREATE POLICY "Developers can manage characters"
ON public.user_characters FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_user_characters_updated_at
BEFORE UPDATE ON public.user_characters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for character avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('character-avatars', 'character-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for character avatars
CREATE POLICY "Anyone can view character avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-avatars');

CREATE POLICY "Users can upload character avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'character-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own character avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'character-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own character avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'character-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
