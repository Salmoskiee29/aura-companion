import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Sparkles, MessageCircle, UserCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentChat {
  modelId: string;
  modelName: string;
  modelAvatar: string;
  online: boolean;
}

const quickActions = [
  { to: '/dashboard/models', icon: Users, label: 'Browse Models', desc: 'Find your perfect companion' },
  { to: '/dashboard/create-character', icon: Sparkles, label: 'Create Character', desc: 'Generate your own AI model' },
  { to: '/dashboard/my-character', icon: UserCircle, label: 'My Character', desc: 'View your saved character' },
  { to: '/dashboard/chats', icon: MessageCircle, label: 'Chats', desc: 'Continue conversations' },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      const { data: convs } = await supabase
        .from('conversations')
        .select('model_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (convs && convs.length > 0) {
        const modelIds = [...new Set(convs.map(c => c.model_id))];
        const { data: models } = await supabase
          .from('companion_models')
          .select('id, name, avatar, online')
          .in('id', modelIds);

        if (models) {
          const modelMap = new Map(models.map(m => [m.id, m]));
          setRecentChats(convs
            .map(c => modelMap.get(c.model_id))
            .filter(Boolean)
            .map(m => ({ modelId: m!.id, modelName: m!.name, modelAvatar: m!.avatar, online: m!.online }))
          );
        }
      }
      setLoadingRecent(false);
    };
    fetchRecent();
  }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Welcome back, <span className="text-gradient-primary">{user?.displayName || 'there'}</span>
        </h1>
        <p className="text-muted-foreground mb-8">What would you like to do today?</p>

        {/* Recent chats - resume instantly */}
        {loadingRecent ? (
          <div className="mb-8">
            <Skeleton className="h-5 w-36 mb-3" />
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-40 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : recentChats.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Resume Chat</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentChats.map(chat => (
                <Link
                  key={chat.modelId}
                  to={`/chat/${chat.modelId}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all shrink-0"
                >
                  <div className="relative">
                    <img src={chat.modelAvatar} alt={chat.modelName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(var(--online))] border-2 border-card" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{chat.modelName}</p>
                    <p className="text-[11px] text-muted-foreground">Continue chatting</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={action.to}
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
