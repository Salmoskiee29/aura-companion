import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChatItem {
  conversationId: string;
  modelId: string;
  modelName: string;
  modelAvatar: string;
  modelOnline: boolean;
  lastMessage: string;
  lastMessageAt: string;
}

export default function DashboardChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      // Get user's conversations with model info
      const { data: convs } = await supabase
        .from('conversations')
        .select('id, model_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!convs || convs.length === 0) {
        setLoading(false);
        return;
      }

      const modelIds = [...new Set(convs.map(c => c.model_id))];
      const { data: models } = await supabase
        .from('companion_models')
        .select('id, name, avatar, online')
        .in('id', modelIds);

      const modelMap = new Map(models?.map(m => [m.id, m]) || []);

      // Get last message for each conversation
      const chatItems: ChatItem[] = [];
      for (const conv of convs) {
        const model = modelMap.get(conv.model_id);
        if (!model) continue;

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('message, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        chatItems.push({
          conversationId: conv.id,
          modelId: conv.model_id,
          modelName: model.name,
          modelAvatar: model.avatar,
          modelOnline: model.online,
          lastMessage: lastMsg?.message || 'Tap to continue chatting...',
          lastMessageAt: lastMsg?.created_at || conv.created_at,
        });
      }

      // Sort by last message time
      chatItems.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setChats(chatItems);
      setLoading(false);
    };
    fetchChats();
  }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Your <span className="text-gradient-primary">Chats</span>
        </h1>
        <p className="text-muted-foreground mb-8">Continue your conversations.</p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No conversations yet.</p>
            <Link to="/dashboard/models">
              <Button variant="outline" className="border-border text-foreground">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Your First Chat
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat, i) => (
              <motion.div
                key={chat.conversationId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/chat/${chat.modelId}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all"
                >
                  <div className="relative">
                    <img src={chat.modelAvatar} alt={chat.modelName} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                    {chat.modelOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--online))] border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{chat.modelName}</p>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(chat.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {chats.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/dashboard/models">
              <Button variant="outline" className="border-border text-foreground">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
