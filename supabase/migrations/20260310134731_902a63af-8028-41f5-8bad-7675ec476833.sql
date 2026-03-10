ALTER TABLE public.subscriptions ALTER COLUMN free_messages_limit SET DEFAULT 20;
UPDATE public.subscriptions SET free_messages_limit = 20 WHERE free_messages_limit = 5;