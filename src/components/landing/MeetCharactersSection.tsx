import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, UserCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedModel {
  id: string;
  name: string;
  avatar: string;
  age: number;
  personality: string;
}

export function MeetCharactersSection() {
  const [models, setModels] = useState<FeaturedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('companion_models')
        .select('id, name, avatar, age, personality')
        .eq('status', 'active');
      const valid = (data || []).filter(m => m.id && m.name);
      setModels(valid);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Skeleton className="h-10 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (models.length === 0) {
    return (
      <section className="py-24 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            MEET OUR BEST <span className="text-gradient-primary">AI CHARACTERS</span>
          </h2>
          <p className="text-muted-foreground text-lg">New AI characters coming soon.</p>
        </div>
      </section>
    );
  }

  const gridCols = models.length >= 6
    ? 'lg:grid-cols-6'
    : models.length >= 4
      ? 'lg:grid-cols-4'
      : 'lg:grid-cols-3';

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-strong text-xs font-medium text-primary uppercase tracking-wider mb-4">
            <Heart className="h-3 w-3" fill="currentColor" />
            Featured Characters
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            MEET OUR BEST <span className="text-gradient-primary">AI CHARACTERS</span>
          </h2>
        </motion.div>

        <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols} gap-4 md:gap-5 max-w-6xl mx-auto`}>
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="h-full"
            >
              <Link to="/auth?mode=signup" className="group block h-full">
                <div className="rounded-2xl overflow-hidden border border-border bg-card glow-card transition-all duration-500 h-full flex flex-col">
                  <div className="relative h-52 md:h-64 overflow-hidden flex-shrink-0">
                    {model.avatar ? (
                      <img
                        src={model.avatar}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <UserCircle className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <p className="font-bold text-foreground text-sm md:text-base leading-tight">
                      {model.name}
                    </p>
                    {model.personality && (
                      <p className="text-xs text-muted-foreground line-clamp-5 leading-relaxed mt-1.5">
                        {model.personality}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                      {model.personality && (
                        <span className="text-[10px] md:text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {model.personality}
                        </span>
                      )}
                      {model.age && (
                        <span className="text-[10px] md:text-[11px] text-muted-foreground">
                          Age {model.age}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/auth?mode=signup">
            <button className="px-8 py-3.5 rounded-full btn-premium text-primary-foreground font-semibold inline-flex items-center gap-2 text-sm">
              Explore All Characters
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
