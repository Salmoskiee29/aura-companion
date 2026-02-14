import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { mockModels } from '@/data/models';
import { toast } from '@/hooks/use-toast';

/* ─── Types ─── */
export interface Chatter {
  id: string;
  name: string;
  status: 'online' | 'offline';
  activeConversationCount: number;
  assignedModelIds: string[]; // which models this chatter can impersonate
}

export interface UserSubscription {
  status: 'inactive' | 'active' | 'cancelled';
  plan: string | null;
  assignedChatterId: string | null;
  modelId: string | null; // model the user is chatting with
}

export interface ChatterConversation {
  id: string;
  userId: string;
  userName: string;
  modelId: string;
  modelName: string;
  modelAvatar: string;
  chatterId: string;
  createdAt: Date;
  messages: { sender: 'user' | 'chatter'; text: string; time: string }[];
}

interface ChatterContextType {
  chatters: Chatter[];
  subscription: UserSubscription;
  conversations: ChatterConversation[];
  notifications: { id: string; message: string; time: Date }[];
  subscribe: (plan: string, modelId?: string) => void;
  cancelSubscription: () => void;
  getAssignedChatter: () => Chatter | null;
  isChatterOnline: () => boolean;
  addUserMessage: (modelId: string, text: string) => void;
  addChatterReply: (conversationId: string, text: string) => void;
  toggleChatterStatus: (chatterId: string) => void;
  dismissNotification: (id: string) => void;
}

const ChatterContext = createContext<ChatterContextType | null>(null);

export function useChatter() {
  const ctx = useContext(ChatterContext);
  if (!ctx) throw new Error('useChatter must be used within ChatterProvider');
  return ctx;
}

/* ─── Mock chatters seeded from model data ─── */
const initialChatters: Chatter[] = [
  { id: 'ch-1', name: 'Anna K.', status: 'online', activeConversationCount: 2, assignedModelIds: ['1', '2'] },
  { id: 'ch-2', name: 'Maria S.', status: 'online', activeConversationCount: 5, assignedModelIds: ['3', '4'] },
  { id: 'ch-3', name: 'Lisa M.', status: 'offline', activeConversationCount: 0, assignedModelIds: ['5', '6'] },
  { id: 'ch-4', name: 'Sarah W.', status: 'online', activeConversationCount: 1, assignedModelIds: ['1', '3', '5'] },
];

const STORAGE_KEY = 'lumiere_chatter_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function ChatterProvider({ children }: { children: ReactNode }) {
  const saved = loadState();

  const [chatters, setChatters] = useState<Chatter[]>(saved?.chatters ?? initialChatters);
  const [subscription, setSubscription] = useState<UserSubscription>(
    saved?.subscription ?? { status: 'inactive', plan: null, assignedChatterId: null, modelId: null }
  );
  const [conversations, setConversations] = useState<ChatterConversation[]>(saved?.conversations ?? []);
  const [notifications, setNotifications] = useState<{ id: string; message: string; time: Date }[]>([]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chatters, subscription, conversations }));
  }, [chatters, subscription, conversations]);

  /* ─── Assignment algorithm: lowest load, online, model-compatible ─── */
  const assignChatter = useCallback((modelId: string): string | null => {
    const eligible = chatters
      .filter(c => c.status === 'online' && c.assignedModelIds.includes(modelId))
      .sort((a, b) => a.activeConversationCount - b.activeConversationCount);

    if (eligible.length === 0) {
      // Fallback: any online chatter
      const anyOnline = chatters
        .filter(c => c.status === 'online')
        .sort((a, b) => a.activeConversationCount - b.activeConversationCount);
      return anyOnline.length > 0 ? anyOnline[0].id : null;
    }

    return eligible[0].id;
  }, [chatters]);

  const subscribe = useCallback((plan: string, modelId?: string) => {
    const mid = modelId || '1';
    const chatterId = assignChatter(mid);
    const model = mockModels.find(m => m.id === mid);

    // Update subscription
    setSubscription({ status: 'active', plan, assignedChatterId: chatterId, modelId: mid });

    // Increment chatter's active count
    if (chatterId) {
      setChatters(prev => prev.map(c =>
        c.id === chatterId ? { ...c, activeConversationCount: c.activeConversationCount + 1 } : c
      ));

      // Create conversation
      const conv: ChatterConversation = {
        id: `conv-${Date.now()}`,
        userId: 'current-user',
        userName: 'You',
        modelId: mid,
        modelName: model?.name || 'Unknown',
        modelAvatar: model?.avatar || '',
        chatterId,
        createdAt: new Date(),
        messages: [],
      };
      setConversations(prev => [...prev, conv]);

      // Push notification to chatter dashboard
      const chatter = chatters.find(c => c.id === chatterId);
      setNotifications(prev => [...prev, {
        id: `notif-${Date.now()}`,
        message: `New subscriber assigned to ${chatter?.name || 'you'} → ${model?.name}`,
        time: new Date(),
      }]);
    }

    toast({
      title: chatterId ? '✨ Premium Activated!' : '✨ Premium Activated (AI Mode)',
      description: chatterId
        ? `You've been connected with a personal companion. Enjoy unlimited chatting!`
        : `No live companion available right now. AI will keep you company until one is ready.`,
    });
  }, [assignChatter, chatters]);

  const cancelSubscription = useCallback(() => {
    if (subscription.assignedChatterId) {
      setChatters(prev => prev.map(c =>
        c.id === subscription.assignedChatterId
          ? { ...c, activeConversationCount: Math.max(0, c.activeConversationCount - 1) }
          : c
      ));
    }
    setSubscription({ status: 'inactive', plan: null, assignedChatterId: null, modelId: null });
  }, [subscription]);

  const getAssignedChatter = useCallback(() => {
    if (!subscription.assignedChatterId) return null;
    return chatters.find(c => c.id === subscription.assignedChatterId) || null;
  }, [subscription, chatters]);

  const isChatterOnline = useCallback(() => {
    const chatter = getAssignedChatter();
    return chatter?.status === 'online';
  }, [getAssignedChatter]);

  const addUserMessage = useCallback((modelId: string, text: string) => {
    setConversations(prev => prev.map(c =>
      c.modelId === modelId && c.userId === 'current-user'
        ? { ...c, messages: [...c.messages, { sender: 'user' as const, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
        : c
    ));
  }, []);

  const addChatterReply = useCallback((conversationId: string, text: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, { sender: 'chatter' as const, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
        : c
    ));
  }, []);

  const toggleChatterStatus = useCallback((chatterId: string) => {
    setChatters(prev => prev.map(c =>
      c.id === chatterId ? { ...c, status: c.status === 'online' ? 'offline' : 'online' } : c
    ));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <ChatterContext.Provider value={{
      chatters, subscription, conversations, notifications,
      subscribe, cancelSubscription, getAssignedChatter, isChatterOnline,
      addUserMessage, addChatterReply, toggleChatterStatus, dismissNotification,
    }}>
      {children}
    </ChatterContext.Provider>
  );
}
