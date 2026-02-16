
-- Add instagram_link and status columns to companion_models
ALTER TABLE public.companion_models 
  ADD COLUMN IF NOT EXISTS instagram_link text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Create storage bucket for model avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('model-avatars', 'model-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can view, admins can upload/update/delete
CREATE POLICY "Public avatar read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'model-avatars');

CREATE POLICY "Admins can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'model-avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'model-avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'model-avatars' AND public.has_role(auth.uid(), 'admin'));
