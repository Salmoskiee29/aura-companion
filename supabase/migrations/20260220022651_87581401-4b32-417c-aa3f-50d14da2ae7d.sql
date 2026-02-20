
-- 2. Add onboarding columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- 3. Create user_notes table for chatter/admin internal notes
CREATE TABLE public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_id uuid NOT NULL,
  personality_summary text DEFAULT '',
  preferred_content_type text DEFAULT '',
  spending_level text DEFAULT 'low',
  highlights text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Chatters can view/edit notes for their assigned users
CREATE POLICY "Chatters can view notes for assigned users"
ON public.user_notes FOR SELECT
USING (
  has_role(auth.uid(), 'chatter'::app_role)
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.user_id = user_notes.user_id
    AND conversations.assigned_chatter_id = auth.uid()
  )
);

CREATE POLICY "Chatters can insert notes"
ON public.user_notes FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'chatter'::app_role)
  AND auth.uid() = author_id
);

CREATE POLICY "Chatters can update own notes"
ON public.user_notes FOR UPDATE
USING (
  has_role(auth.uid(), 'chatter'::app_role)
  AND auth.uid() = author_id
);

-- Admins and developers can manage all notes
CREATE POLICY "Admins can manage all notes"
ON public.user_notes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Developers can manage all notes"
ON public.user_notes FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

-- Add developer policies to existing tables
CREATE POLICY "Developers can manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage profiles"
ON public.profiles FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage subscriptions"
ON public.subscriptions FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage conversations"
ON public.conversations FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage messages"
ON public.messages FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage chatters"
ON public.chatters FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage models"
ON public.companion_models FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage wallets"
ON public.gem_wallets FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage transactions"
ON public.gem_transactions FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can manage queue"
ON public.waiting_queue FOR ALL
USING (has_role(auth.uid(), 'developer'::app_role));

-- Trigger for updated_at on user_notes
CREATE TRIGGER update_user_notes_updated_at
BEFORE UPDATE ON public.user_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
