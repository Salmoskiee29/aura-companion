import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Eye, Diamond, Sparkles, X, Unlock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PremiumModel {
  id: string;
  name: string;
  avatar: string;
}

interface ContentItem {
  id: string;
  model_id: string;
  media_url: string;
  preview_url: string | null;
  price: number;
  is_locked: boolean;
  requires_model_subscription: boolean;
  title: string;
  media_type: string;
}

const Premium = () => {
  const { isVip, loading } = useSubscriptionTier();
  const { user } = useAuth();
  const [models, setModels] = useState<PremiumModel[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [modelsRes, contentRes] = await Promise.all([
      supabase.from('companion_models').select('id, name, avatar').eq('status', 'active').limit(12),
      supabase.from('premium_content').select('*').eq('is_locked', true).order('created_at', { ascending: false }),
    ]);
    if (modelsRes.data) setModels(modelsRes.data);
    if (contentRes.data) setContent(contentRes.data as ContentItem[]);

    // Fetch user's unlocked content
    if (user?.id) {
      const { data: unlocks } = await supabase
        .from('content_unlocks')
        .select('content_id')
        .eq('user_id', user.id);
      if (unlocks) {
        setUnlockedIds(new Set(unlocks.map(u => u.content_id)));
      }
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter content by selected model
  const filteredContent = selectedModelId
    ? content.filter(c => c.model_id === selectedModelId)
    : content;

  // Only show models that have content
  const modelsWithContent = models.filter(m => content.some(c => c.model_id === m.id));
  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleUnlock = async (item: ContentItem) => {
    if (!user?.id) return;
    setUnlocking(item.id);
    try {
      // Deduct gems from wallet
      const { data: wallet } = await supabase
        .from('gem_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      const gemCost = Math.ceil(item.price);
      if (!wallet || wallet.balance < gemCost) {
        toast.error(`Not enough gems. You need ${gemCost} 💎`);
        return;
      }

      // Deduct balance
      const { error: walletErr } = await supabase
        .from('gem_wallets')
        .update({ balance: wallet.balance - gemCost })
        .eq('user_id', user.id);
      if (walletErr) throw walletErr;

      // Record transaction
      await supabase.from('gem_transactions').insert({
        user_id: user.id,
        amount: -gemCost,
        type: 'unlock',
        description: `Unlocked: ${item.title || 'Premium content'}`,
      });

      // Record unlock
      const { error: unlockErr } = await supabase
        .from('content_unlocks')
        .insert({ user_id: user.id, content_id: item.id });
      if (unlockErr) throw unlockErr;

      setUnlockedIds(prev => new Set([...prev, item.id]));
      toast.success('Content unlocked! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unlock');
    } finally {
      setUnlocking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isVip) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
          <Crown className="h-4 w-4" />
          VIP EXCLUSIVE
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Premium <span className="text-gradient-primary">Content</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your exclusive collection of premium models and locked content.
        </p>
      </motion.div>

      {/* Exclusive Models */}
      {modelsWithContent.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Exclusive Models
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modelsWithContent.map((m, i) => {
              const isActive = selectedModelId === m.id;
              const contentCount = content.filter(c => c.model_id === m.id).length;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedModelId(isActive ? null : m.id)}
                  className={`relative group cursor-pointer transition-all duration-300 rounded-2xl ${
                    isActive
                      ? 'ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
                      : 'hover:ring-1 hover:ring-primary/40'
                  }`}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden border border-border/30 bg-secondary/30">
                    <img src={m.avatar} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Crown className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <span className="text-[10px] text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
                        {contentCount} item{contentCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm font-medium mt-2 truncate text-center transition-colors ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}>{m.name}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Content Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {selectedModel ? (
              <>Content from <span className="text-primary">{selectedModel.name}</span></>
            ) : (
              'All Premium Content'
            )}
          </h2>
          {selectedModelId && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedModelId(null)} className="text-muted-foreground hover:text-foreground gap-1.5">
              <X className="h-3.5 w-3.5" /> Show All
            </Button>
          )}
        </div>

        {filteredContent.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
            <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No content available yet. Check back soon!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredContent.map((item, i) => {
                const isUnlocked = unlockedIds.has(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-border/20"
                  >
                    {isUnlocked ? (
                      // Unlocked: show full content
                      <>
                        <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-bold flex items-center gap-1">
                            <Unlock className="h-2.5 w-2.5" /> Unlocked
                          </span>
                        </div>
                      </>
                    ) : (
                      // Locked: show blurred preview
                      <>
                        {item.preview_url ? (
                          <img src={item.preview_url} alt="" className="w-full h-full object-cover blur-lg scale-110" />
                        ) : item.media_url ? (
                          <img src={item.media_url} alt="" className="w-full h-full object-cover blur-xl scale-110" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary" />
                        )}
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                          <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Lock className="h-6 w-6 text-primary" />
                          </div>
                          {item.title && (
                            <span className="text-xs text-foreground font-medium px-3 text-center line-clamp-2">{item.title}</span>
                          )}
                          {item.requires_model_subscription ? (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                              <Star className="h-3 w-3 text-primary" />
                              <span className="text-[10px] font-bold text-primary">Model Sub Required</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUnlock(item)}
                              disabled={unlocking === item.id}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 hover:bg-primary/25 transition-colors cursor-pointer"
                            >
                              <Diamond className="h-3 w-3 text-primary" />
                              <span className="text-xs font-bold text-primary">
                                {unlocking === item.id ? 'Unlocking...' : `${Math.ceil(item.price)} 💎`}
                              </span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default Premium;
