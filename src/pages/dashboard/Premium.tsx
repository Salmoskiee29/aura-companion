import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Eye, Diamond, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PremiumModel {
  id: string;
  name: string;
  avatar: string;
}

// Placeholder locked content items
const lockedContent = Array.from({ length: 12 }, (_, i) => ({
  id: `content-${i}`,
  price: [2, 3, 5, 4, 3, 5, 2, 4, 3, 5, 2, 4][i],
  gradient: [
    'from-pink-500/40 to-purple-600/40',
    'from-violet-500/40 to-indigo-600/40',
    'from-rose-500/40 to-pink-600/40',
    'from-fuchsia-500/40 to-purple-600/40',
  ][i % 4],
}));

const Premium = () => {
  const { isVip, loading } = useSubscriptionTier();
  const [models, setModels] = useState<PremiumModel[]>([]);

  useEffect(() => {
    supabase
      .from('companion_models')
      .select('id, name, avatar')
      .eq('status', 'active')
      .limit(6)
      .then(({ data }) => {
        if (data) setModels(data);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // CRITICAL: Hide entirely for non-VIP
  if (!isVip) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
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

      {/* Featured Models */}
      {models.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Exclusive Models
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {models.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative group cursor-pointer"
              >
                <div className="aspect-square rounded-2xl overflow-hidden border border-border/30 bg-secondary/30">
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
                <p className="text-sm font-medium text-foreground mt-2 truncate text-center">{m.name}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Locked Content Grid */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Locked Content
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {lockedContent.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.03 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer border border-border/20"
              >
                {/* Blurred content placeholder */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} blur-sm`} />
                <div className="absolute inset-0 bg-background/50 backdrop-blur-2xl" />

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Unlock to view</span>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <Diamond className="h-3 w-3 text-primary" />
                    <span className="text-xs font-bold text-primary">{item.price}</span>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/15 to-transparent z-5" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Premium;
