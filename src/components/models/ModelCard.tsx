import { CompanionModel } from '@/types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Instagram, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ModelCardProps {
  model: CompanionModel;
  index?: number;
}

export const ModelCard = ({ model, index = 0 }: ModelCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!model.id || !model.name) {
      toast.error('This character is unavailable.');
      return;
    }
    navigate(`/chat/${model.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="h-full"
    >
      <div onClick={handleClick} className="cursor-pointer h-full">
        <div className="group rounded-2xl overflow-hidden border border-border bg-card glow-card transition-all duration-500 h-full flex flex-col">
          {/* Fixed-height image */}
          <div className="relative h-52 md:h-64 overflow-hidden flex-shrink-0">
            {model.avatar ? (
              <img
                src={model.avatar}
                alt={model.name || 'Character'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <UserCircle className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            {model.online && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] text-white font-medium">Online</span>
              </div>
            )}
          </div>

          {/* Text section */}
          <div className="p-3 md:p-4 flex-1 flex flex-col">
            <div>
              <h3 className="text-sm md:text-base font-bold text-foreground leading-tight">
                {model.name || 'Unknown'}{model.age ? `, ${model.age}` : ''}
              </h3>
              {(model.nationality || model.occupation) && (
                <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
                  {[model.nationality, model.occupation].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {model.personality && (
              <p className="text-xs text-muted-foreground line-clamp-5 leading-relaxed mt-2">
                {model.personality}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
              <div className="flex flex-wrap gap-1.5 items-center min-w-0 flex-1">
                {(model.traits || []).slice(0, 2).map((trait) => (
                  <span key={trait} className="text-[10px] md:text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 truncate max-w-[100px]">
                    {trait}
                  </span>
                ))}
                {model.instagramLink && (
                  <a
                    href={model.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
