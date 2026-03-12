import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
        .eq('is_featured', true)
        .eq('status', 'active');
      setModels(data || []);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  if (loading) return null;
  if (models.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            MEET OUR BEST <span className="text-gradient-primary">AI CHARACTERS</span>
          </h2>
        </motion.div>

        <div className={`grid grid-cols-2 md:grid-cols-3 ${models.length >= 6 ? 'lg:grid-cols-6' : models.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 max-w-6xl mx-auto`}>
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to="/auth?mode=signup" className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border border-border bg-card">
                  <img
                    src={model.avatar}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-semibold text-foreground text-sm">{model.name}</p>
                    <p className="text-[11px] text-muted-foreground">Age {model.age} · {model.personality}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/auth?mode=signup">
            <button className="px-8 py-3 rounded-full btn-premium text-primary-foreground font-semibold inline-flex items-center gap-2">
              Explore All Characters
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
