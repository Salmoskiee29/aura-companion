import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  modelName: string;
}

export const PaywallModal = ({ open, onClose, modelName }: PaywallModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 max-w-md w-full"
          >
            <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden border-primary/20">
              {/* Decorative glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/15 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 blur-[60px] rounded-full pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10">
                {/* Animated heart */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Heart className="h-8 w-8 text-primary" fill="hsl(var(--primary))" />
                </motion.div>

                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  She wants to keep talking... ❤️
                </h3>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                  {modelName} is waiting for your reply.<br />
                  Unlock unlimited access to continue this connection.
                </p>

                <div className="space-y-3">
                  <Link to="/dashboard/billing">
                    <button className="w-full py-4 rounded-2xl btn-premium text-primary-foreground font-semibold text-base">
                      <Crown className="inline mr-2 h-5 w-5" />
                      Unlock Unlimited — $14.99/mo
                    </button>
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    Maybe later
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-center gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" /> Unlimited messages
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" /> All companions
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
