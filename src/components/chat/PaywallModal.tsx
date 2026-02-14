import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 max-w-md w-full"
          >
            <div className="bg-card border border-border rounded-3xl p-8 text-center relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl rounded-full" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 animate-pulse-glow">
                  <Heart className="h-8 w-8 text-primary" />
                </div>

                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Don't Leave Me Yet...
                </h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Hey... I want to keep talking with you ❤️<br />
                  {modelName} is waiting for your reply. Unlock unlimited chat to continue this connection.
                </p>

                <div className="space-y-3">
                  <Link to="/billing">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base glow-primary">
                      <Crown className="mr-2 h-5 w-5" />
                      Unlock Unlimited — $14.99/mo
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Maybe later
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent" /> Unlimited messages
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent" /> All companions
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
