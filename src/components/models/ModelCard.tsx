import { CompanionModel } from '@/types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

interface ModelCardProps {
  model: CompanionModel;
  index?: number;
}

export const ModelCard = ({ model, index = 0 }: ModelCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link to={`/chat/${model.id}`}>
        <div className="group rounded-2xl overflow-hidden border border-border bg-card glow-card transition-all duration-500">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={model.avatar}
              alt={model.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Online badge */}
            {model.online && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-card">
                <div className="w-2 h-2 rounded-full bg-online animate-pulse" />
                <span className="text-[11px] text-foreground font-medium">Online</span>
              </div>
            )}

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-foreground drop-shadow-lg">{model.name}, {model.age}</h3>
              <p className="text-sm text-foreground/70">{model.nationality} · {model.occupation}</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{model.personality}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {model.traits.slice(0, 2).map((trait) => (
                  <span key={trait} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {trait}
                  </span>
                ))}
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
