import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      setModels(data || []);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  if (loading) return null;

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

        <div className={`grid grid-cols-2 md:grid-cols-3 ${models.length >= 6 ? 'lg:grid-cols-6' : models.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-5 max-w-6xl mx-auto`}>
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to="/auth?mode=signup" className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] glass-card-strong glow-card">
                  <img
                    src={model.avatar}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                  
                  {/* Gradient border glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: 'inset 0 0 0 1px hsl(325 80% 58% / 0.4), 0 0 30px -5px hsl(325 80% 58% / 0.2)',
                    }}
                  />
                  
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <p className="font-semibold text-foreground text-sm">{model.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                        {model.personality}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Age {model.age}</span>
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
