import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Sparkles, MessageCircle, UserCircle, ArrowRight, Crown, Diamond, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface RecentChat {
  modelId: string;
  modelName: string;
  modelAvatar: string;
  online: boolean;
}

interface SubInfo {
  tier: string;
  status: string;
  free_messages_used: number;
  free_messages_limit: number;
  daily_human_replies_used: number;
  daily_human_replies_limit: number;
}

const FREE_DAILY_LIMIT = 20;

const TIER_LABELS: Record<string, string> = {
  free: 'Free Tier',
  basic: 'Basic Subscriber',
  premium: 'Premium Subscriber',
  vip: 'VIP Subscriber',
};

const TIER_ICONS: Record<string, typeof Sparkles> = {
  free: Sparkles,
  basic: Crown,
  premium: Crown,
  vip: Zap,
};

const quickActions = [
  { to: '/dashboard/models', icon: Users, label: 'Browse Models', desc: 'Chat with public AI companions' },
  { to: '/dashboard/create-character', icon: Sparkles, label: 'Create Character', desc: 'Build your own AI companion' },
  { to: '/dashboard/my-characters', icon: UserCircle, label: 'My Characters', desc: 'View your saved characters' },
  { to: '/dashboard/chats', icon: MessageCircle, label: 'Chats', desc: 'Continue conversations' },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
  const [gemBalance, setGemBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch recent chats
    const fetchRecent = async () => {
      const { data: convs } = await supabase
        .from('conversations')
        .select('model_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (convs && convs.length > 0) {
        const modelIds = [...new Set(convs.map(c => c.model_id))];
        
        // Fetch both companion models and user characters in parallel
        const [modelsRes, charsRes] = await Promise.all([
          supabase.from('companion_models').select('id, name, avatar, online').in('id', modelIds),
          supabase.from('user_characters').select('id, name, avatar_url').in('id', modelIds),
        ]);

        const chatMap = new Map<string, RecentChat>();
        
        modelsRes.data?.forEach(m => {
          chatMap.set(m.id, { modelId: m.id, modelName: m.name, modelAvatar: m.avatar, online: m.online });
        });
        
        charsRes.data?.forEach(c => {
          chatMap.set(c.id, { modelId: `user-${c.id}`, modelName: c.name, modelAvatar: c.avatar_url || '', online: true });
        });

        const recent = modelIds
          .map(id => chatMap.get(id))
          .filter(Boolean) as RecentChat[];
        
        setRecentChats(recent.slice(0, 3));
      }
      setLoadingRecent(false);
    };

    // Fetch subscription info
    const fetchSub = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('tier, status, free_messages_used, free_messages_limit, daily_human_replies_used, daily_human_replies_limit')
        .eq('user_id', user.id)
        .single();
      if (data) setSubInfo(data as SubInfo);
    };

    // Fetch gem balance
    const fetchGems = async () => {
      const { data } = await supabase.from('gem_wallets').select('balance').eq('user_id', user.id).single();
      if (data) setGemBalance(data.balance);
    };

    fetchRecent();
    fetchSub();
    fetchGems();
  }, [user]);

  const tier = (subInfo?.status === 'active' && subInfo?.tier && subInfo.tier !== 'free') ? subInfo.tier : 'free';
  const TierIcon = TIER_ICONS[tier] || Sparkles;
  const tierLabel = TIER_LABELS[tier] || 'Free Tier';

  const isFree = tier === 'free';
  const messagesUsed = isFree ? (subInfo?.free_messages_used || 0) : (subInfo?.daily_human_replies_used || 0);
  const messagesLimit = isFree ? FREE_DAILY_LIMIT : (subInfo?.daily_human_replies_limit || 999);
  const messagesRemaining = Math.max(0, messagesLimit - messagesUsed);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Welcome back, <span className="text-gradient-primary">{user?.displayName || 'there'}</span>
        </h1>
        <p className="text-muted-foreground mb-6">What would you like to do today?</p>

        {/* Subscription Status Card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
              <TierIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{tierLabel}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border">
              <Diamond className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{gemBalance} Diamonds</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {isFree
                  ? `Free Messages Remaining Today: ${messagesRemaining}`
                  : messagesLimit >= 999
                    ? 'Unlimited chats'
                    : `${messagesRemaining} chats remaining today`
                }
              </span>
            </div>
            {isFree && (
              <Link to="/billing">
                <Button size="sm" className="btn-premium text-primary-foreground text-xs">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent chats */}
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
