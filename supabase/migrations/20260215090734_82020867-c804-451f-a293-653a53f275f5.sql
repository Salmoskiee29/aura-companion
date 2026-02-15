
-- Create chatters table for chatter-specific data
CREATE TABLE public.chatters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  max_capacity integer NOT NULL DEFAULT 10,
  active_conversations integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatters ENABLE ROW LEVEL SECURITY;

-- Chatters can view and update their own record
CREATE POLICY "Chatters can view own record"
ON public.chatters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Chatters can update own status"
ON public.chatters FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all chatters
CREATE POLICY "Admins can manage chatters"
ON public.chatters FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view chatters (needed for assignment visibility)
CREATE POLICY "Users can view chatters"
ON public.chatters FOR SELECT
USING (public.has_role(auth.uid(), 'user'));

-- Trigger for updated_at
CREATE TRIGGER update_chatters_updated_at
BEFORE UPDATE ON public.chatters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add a waiting_queue table for users when no chatter is available
CREATE TABLE public.waiting_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  model_id uuid NOT NULL REFERENCES public.companion_models(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'cancelled'))
);

ALTER TABLE public.waiting_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue entries"
ON public.waiting_queue FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue entries"
ON public.waiting_queue FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage queue"
ON public.waiting_queue FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
