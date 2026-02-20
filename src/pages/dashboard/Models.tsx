import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModelCard } from '@/components/models/ModelCard';
import { supabase } from '@/integrations/supabase/client';
import { CompanionModel } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function ModelSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function DashboardModels() {
  const [models, setModels] = useState<CompanionModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      const { data } = await supabase
        .from('companion_models')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data) {
        setModels(data.map((m: any) => ({
          id: m.id,
          name: m.name,
          age: m.age,
          nationality: m.nationality,
          languages: m.languages,
          personality: m.personality,
          occupation: m.occupation,
          hobbies: m.hobbies,
          relationshipStyle: m.relationship_style,
          traits: m.traits,
          conversationSpeed: m.conversation_speed as any,
          emojiUsage: m.emoji_usage as any,
          messageLength: m.message_length as any,
          avatar: m.avatar,
          online: m.online,
          instagramLink: m.instagram_link,
        })));
      }
      setLoading(false);
    };
    fetchModels();
  }, []);

  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Meet Your <span className="text-gradient-primary">Companions</span>
        </h1>
        <p className="text-muted-foreground">Choose someone who matches your vibe.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl">
          {Array.from({ length: 8 }).map((_, i) => (
            <ModelSkeleton key={i} />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No companions available yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl">
          {models.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
