-- Fix restrictive policies on all tables

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Chatters can view assigned conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can manage conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Chatters can view assigned conversations" ON public.conversations FOR SELECT USING (has_role(auth.uid(), 'chatter'::app_role) AND assigned_chatter_id = auth.uid());
CREATE POLICY "Admins can manage conversations" ON public.conversations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Chatters can view assigned messages" ON public.messages;
DROP POLICY IF EXISTS "Chatters can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON public.messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Chatters can view assigned messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.assigned_chatter_id = auth.uid()));
CREATE POLICY "Chatters can insert messages" ON public.messages FOR INSERT WITH CHECK (has_role(auth.uid(), 'chatter'::app_role) AND EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.assigned_chatter_id = auth.uid()));
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- chatters
DROP POLICY IF EXISTS "Chatters can view own record" ON public.chatters;
DROP POLICY IF EXISTS "Chatters can update own status" ON public.chatters;
DROP POLICY IF EXISTS "Users can view chatters" ON public.chatters;
DROP POLICY IF EXISTS "Admins can manage chatters" ON public.chatters;
CREATE POLICY "Chatters can view own record" ON public.chatters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Chatters can update own status" ON public.chatters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view chatters" ON public.chatters FOR SELECT USING (has_role(auth.uid(), 'user'::app_role));
CREATE POLICY "Admins can manage chatters" ON public.chatters FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- companion_models
DROP POLICY IF EXISTS "Anyone can view models" ON public.companion_models;
DROP POLICY IF EXISTS "Admins can manage models" ON public.companion_models;
CREATE POLICY "Anyone can view models" ON public.companion_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage models" ON public.companion_models FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- waiting_queue
DROP POLICY IF EXISTS "Users can view own queue entries" ON public.waiting_queue;
DROP POLICY IF EXISTS "Users can insert own queue entries" ON public.waiting_queue;
DROP POLICY IF EXISTS "Admins can manage queue" ON public.waiting_queue;
CREATE POLICY "Users can view own queue entries" ON public.waiting_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own queue entries" ON public.waiting_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage queue" ON public.waiting_queue FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
