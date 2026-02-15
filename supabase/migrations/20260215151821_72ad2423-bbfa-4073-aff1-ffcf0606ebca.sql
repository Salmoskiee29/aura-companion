
-- Gem wallets table
CREATE TABLE public.gem_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gem_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.gem_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.gem_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage wallets" ON public.gem_wallets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_gem_wallets_updated_at
  BEFORE UPDATE ON public.gem_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gem transactions table
CREATE TABLE public.gem_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'spent', 'purchased', 'bonus')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gem_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.gem_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage transactions" ON public.gem_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-create gem wallet on signup (update existing trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  INSERT INTO public.subscriptions (user_id, status, plan)
  VALUES (NEW.id, 'inactive', 'free');

  INSERT INTO public.gem_wallets (user_id, balance)
  VALUES (NEW.id, 10);

  RETURN NEW;
END;
$$;

-- Add daily_human_replies_used and daily_human_replies_limit to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS daily_human_replies_limit integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_human_replies_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free';
