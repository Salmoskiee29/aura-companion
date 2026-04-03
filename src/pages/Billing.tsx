import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Diamond, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TIERS, DIAMOND_BUNDLES, type TierKey } from '@/data/stripe-tiers';

const tierIcons: Record<TierKey, typeof Sparkles> = {
  free: Sparkles,
  basic: ShieldCheck,
  premium: Crown,
  vip: Zap,
};

const tierFeatures: Record<TierKey, string[]> = {
  free: ['10 diamonds to start', 'AI chat (diamond-based)', '1 character slot', 'Basic AI image generation'],
  basic: ['Unlimited AI chat', '15 daily AI chats', '5 character slots', 'Standard image generations', 'Purchase diamond bundles'],
  premium: ['Unlimited AI chat', '50 daily AI chats', 'Unlimited characters', 'More image generations', '50 daily diamond bonus', 'Faster AI responses'],
  vip: ['Unlimited AI chat', 'Unlimited daily chats', 'Unlimited characters', 'Unlimited image generations', '150 daily diamond bonus', 'Priority AI responses', 'VIP badge ✨'],
};

const handleDisabledClick = () => {
  toast.info('Premium features are coming soon. Currently all features are free! 🎉');
};

const Billing = () => {
  const tierKeys: TierKey[] = ['free', 'basic', 'premium', 'vip'];

  return (
    <div className="p-6 md:p-8 space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Choose Your <span className="text-gradient-primary">Plan</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          All features are currently <span className="text-primary font-semibold">free</span>. Premium plans coming soon!
        </p>
        <div className="mt-6">
          <Badge className="bg-primary/10 text-primary border-primary/30 text-sm px-4 py-1.5">
            🎉 Free Access — All Features Unlocked
          </Badge>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {tierKeys.map((key, i) => {
          const tier = TIERS[key];
          const Icon = tierIcons[key];
          const isHighlight = key === 'premium';
          const isFree = key === 'free';

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-6 border relative flex flex-col ${
                isHighlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              {!isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full border border-border">
                  Coming Soon
                </div>
              )}
              {isFree && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Active
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-0.5">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {tierFeatures[key].map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {isFree ? (
                <Button className="w-full bg-primary text-primary-foreground" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full opacity-50 cursor-not-allowed"
                  variant="secondary"
                  onClick={handleDisabledClick}
                >
                  Coming Soon
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Diamond Store — disabled */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            <Diamond className="inline h-6 w-6 text-primary mr-2" />
            Diamond Store
          </h2>
          <Badge className="bg-muted text-muted-foreground border-border text-xs">Coming Soon</Badge>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {DIAMOND_BUNDLES.map((bundle, i) => (
            <motion.div
              key={bundle.diamonds}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="rounded-2xl p-6 border border-border bg-card text-center opacity-60"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Diamond className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{bundle.diamonds}</h3>
              <p className="text-sm text-muted-foreground mb-4">Diamonds</p>
              <Button
                className="w-full opacity-50 cursor-not-allowed"
                variant="secondary"
                onClick={handleDisabledClick}
              >
                {bundle.price}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Billing;
