import { CompanionModel } from '@/types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ModelCardProps {
  model: CompanionModel;
  index?: number;
}

export const ModelCard = ({ model, index = 0 }: ModelCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/chat/${model.id}`}>
        <div className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={model.avatar}
              alt={model.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            {model.online && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-foreground">Online</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-foreground">{model.name}, {model.age}</h3>
              <p className="text-sm text-muted-foreground">{model.nationality} • {model.occupation}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{model.personality}</p>
            <div className="flex flex-wrap gap-1.5">
              {model.traits.slice(0, 3).map((trait) => (
                <span key={trait} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
