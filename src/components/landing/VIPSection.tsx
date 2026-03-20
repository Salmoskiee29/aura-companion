import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Crown, Eye, MessageCircle, Diamond, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';

const blurredPreviews = [
  { gradient: 'from-pink-500/30 to-purple-600/30' },
  { gradient: 'from-violet-500/30 to-indigo-600/30' },
  { gradient: 'from-rose-500/30 to-pink-600/30' },
  { gradient: 'from-fuchsia-500/30 to-purple-600/30' },
  { gradient: 'from-purple-500/30 to-violet-600/30' },
  { gradient: 'from-pink-400/30 to-rose-600/30' },
];

const features = [
  { icon: Crown, text: 'Access to exclusive VIP models' },
  { icon: Eye, text: 'View locked premium content' },
  { icon: Lock, text: 'Pay-per-view unlock system' },
  { icon: Star, text: 'Private model subscriptions' },
  { icon: MessageCircle, text: 'Direct messaging with models' },
  { icon: Diamond, text: 'Send tips & premium interactions' },
];

export function VIPSection() {
  const { isAuthenticated } = useAuth();
  const { isVip } = useSubscriptionTier();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[250px] opacity-20 bg-primary" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
            <Crown className="h-4 w-4" />
            VIP ONLY
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-center text-foreground mb-4"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Unlock <span className="text-gradient-primary">Exclusive Content</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground text-lg text-center mb-14 max-w-xl mx-auto"
        >
          Get access to premium models, private content, and exclusive experiences.
        </motion.p>

        {/* Blurred Preview Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16"
        >
          {blurredPreviews.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
            >
              {/* Blurred gradient background simulating content */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} blur-sm`} />
              <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/70 backdrop-blur-xl" />

              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  VIP Only
                </span>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/10 to-transparent z-5" />
            </motion.div>
          ))}
        </motion.div>

        {/* Feature list + CTA */}
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground/90">{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            {isAuthenticated && isVip ? (
              <Link to="/dashboard/premium">
                <Button size="lg" className="btn-premium px-8 py-6 text-base font-bold">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Go to Premium Dashboard
                </Button>
              </Link>
            ) : (
              <Link to={isAuthenticated ? '/dashboard/billing' : '/auth?mode=login'}>
                <Button size="lg" className="btn-premium px-8 py-6 text-base font-bold">
                  <Crown className="mr-2 h-5 w-5" />
                  Subscribe to VIP — $29.99/mo
                </Button>
              </Link>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Limited access · Exclusive · Private
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
