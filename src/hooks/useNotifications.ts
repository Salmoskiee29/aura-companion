import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AppNotification {
  id: string;
  type: 'credits' | 'unread' | 'reminder';
  title: string;
  message: string;
  modelId?: string;
  createdAt: Date;
  read: boolean;
}

const LOW_CREDIT_THRESHOLD = 5;
const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes between same type

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetch = useRef<Record<string, number>>({});

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const now = Date.now();
      const newNotifs: AppNotification[] = [];

      // 1. Check diamond balance
      const shouldCheckCredits = !lastFetch.current['credits'] || (now - lastFetch.current['credits']) > NOTIFICATION_COOLDOWN_MS;
      if (shouldCheckCredits) {
        const { data: wallet } = await supabase
          .from('gem_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (wallet) {
          if (wallet.balance <= 0) {
            newNotifs.push({
              id: 'credits-depleted',
              type: 'credits',
              title: 'Credits Depleted',
              message: "You've run out of diamonds. Some features may be limited.",
              createdAt: new Date(),
              read: false,
            });
          } else if (wallet.balance <= LOW_CREDIT_THRESHOLD) {
            newNotifs.push({
              id: 'credits-low',
              type: 'credits',
              title: 'Credits Running Low',
              message: `You only have ${wallet.balance} diamond${wallet.balance !== 1 ? 's' : ''} remaining.`,
              createdAt: new Date(),
              read: false,
            });
          }
          lastFetch.current['credits'] = now;
        }
      }

      // 2. Check unread messages — find conversations where last message is from model (not user)
      const { data: convs } = await supabase
        .from('conversations')
        .select('id, model_id')
        .eq('user_id', user.id);

      if (convs && convs.length > 0) {
        // Get model names for display
        const modelIds = [...new Set(convs.map(c => c.model_id))];
        const [modelsRes, charsRes] = await Promise.all([
          supabase.from('companion_models').select('id, name').in('id', modelIds),
          supabase.from('user_characters').select('id, name').in('id', modelIds),
        ]);
        const nameMap = new Map<string, string>();
        modelsRes.data?.forEach(m => nameMap.set(m.id, m.name.trim()));
        charsRes.data?.forEach(c => nameMap.set(c.id, c.name.trim()));

        // Check last message per conversation
        const unreadConvs: { modelId: string; modelName: string }[] = [];
        const waitingConvs: { modelId: string; modelName: string; lastMsgTime: string }[] = [];

        for (const conv of convs.slice(0, 20)) { // limit to 20 conversations
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('sender_type, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!lastMsg) continue;
          const modelName = nameMap.get(conv.model_id) || 'Someone';

          if (lastMsg.sender_type === 'model' || lastMsg.sender_type === 'ai') {
            // Last message is from the model — user hasn't replied
            unreadConvs.push({ modelId: conv.model_id, modelName });
          }

          // Check if there's a conversation the user hasn't engaged with recently (>24h)
          const lastMsgDate = new Date(lastMsg.created_at);
          const hoursSince = (now - lastMsgDate.getTime()) / (1000 * 60 * 60);
          if (hoursSince > 24 && lastMsg.sender_type !== 'user') {
            waitingConvs.push({ modelId: conv.model_id, modelName, lastMsgTime: lastMsg.created_at });
          }
        }

        // Create unread notifications (max 3)
        if (unreadConvs.length > 0) {
          if (unreadConvs.length === 1) {
            newNotifs.push({
              id: `unread-${unreadConvs[0].modelId}`,
              type: 'unread',
              title: 'New Message',
              message: `${unreadConvs[0].modelName} sent you a message`,
              modelId: unreadConvs[0].modelId,
              createdAt: new Date(),
              read: false,
            });
          } else {
            newNotifs.push({
              id: 'unread-multiple',
              type: 'unread',
              title: 'Unread Messages',
              message: `You have unread messages from ${unreadConvs.slice(0, 3).map(c => c.modelName).join(', ')}${unreadConvs.length > 3 ? ` and ${unreadConvs.length - 3} more` : ''}`,
              createdAt: new Date(),
              read: false,
            });
          }
        }

        // Create return reminders (max 2, only for waiting convs not already in unread)
        const unreadIds = new Set(unreadConvs.map(c => c.modelId));
        const uniqueWaiting = waitingConvs.filter(c => !unreadIds.has(c.modelId));
        for (const w of uniqueWaiting.slice(0, 2)) {
          newNotifs.push({
            id: `reminder-${w.modelId}`,
            type: 'reminder',
            title: 'Waiting for You',
            message: `${w.modelName} is waiting for your reply`,
            modelId: w.modelId,
            createdAt: new Date(),
            read: false,
          });
        }
      }

      // Merge with existing — preserve read state for same IDs
      setNotifications(prev => {
        const readSet = new Set(prev.filter(n => n.read).map(n => n.id));
        return newNotifs.map(n => ({ ...n, read: readSet.has(n.id) }));
      });
      setLoading(false);
    };

    fetchNotifications();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
