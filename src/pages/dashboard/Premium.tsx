import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Eye, Diamond, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PremiumModel {
  id: string;
  name: string;
  avatar: string;
}

interface ContentItem {
  id: string;
  modelId: string;
  price: number;
  isLocked: boolean;
  gradient: string;
}

const gradients = [
  'from-pink-500/40 to-purple-600/40',
  'from-violet-500/40 to-indigo-600/40',
  'from-rose-500/40 to-pink-600/40',
  'from-fuchsia-500/40 to-purple-600/40',
];

const Premium = () => {
  const { isVip, loading } = useSubscriptionTier();
  const [models, setModels] = useState<PremiumModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

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

  // Generate content items tied to models
  const allContent = useMemo<ContentItem[]>(() => {
    if (models.length === 0) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: `content-${i}`,
      modelId: models[i % models.length].id,
      price: [2, 3, 5, 4, 3, 5, 2, 4, 3, 5, 2, 4][i],
      isLocked: true,
      gradient: gradients[i % gradients.length],
    }));
  }, [models]);

  const filteredContent = selectedModelId
    ? allContent.filter((c) => c.modelId === selectedModelId)
    : allContent;

  const selectedModel = models.find((m) => m.id === selectedModelId);

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

      {/* Exclusive Models */}
      {models.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Exclusive Models
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {models.map((m, i) => {
              const isActive = selectedModelId === m.id;
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
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Crown className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
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

      {/* Locked Content */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {selectedModel ? (
              <>Content from <span className="text-primary">{selectedModel.name}</span></>
            ) : (
              'Locked Content'
            )}
          </h2>
          {selectedModelId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedModelId(null)}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Show All
            </Button>
          )}
        </div>

        {filteredContent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-muted-foreground"
          >
            <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No content available for this model yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredContent.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer border border-border/20"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} blur-sm`} />
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-2xl" />

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

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/15 to-transparent z-5" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default Premium;
