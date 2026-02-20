import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Diamond, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TIERS, DIAMOND_BUNDLES, type TierKey } from '@/data/stripe-tiers';
import { useSearchParams } from 'react-router-dom';

const tierIcons: Record<TierKey, typeof Sparkles> = {
  free: Sparkles,
  basic: ShieldCheck,
  premium: Crown,
  vip: Zap,
};

const tierFeatures: Record<TierKey, string[]> = {
  free: ['10 diamonds to start', 'AI chat only', 'No human priority', 'No image requests'],
  basic: ['Unlimited AI chat', '15 human replies/day', 'Standard priority', 'Access official models', 'Purchase diamond bundles'],
  premium: ['Unlimited AI chat', '50 human replies/day', 'Faster priority', 'Extended memory', '50 daily diamond bonus', 'Discounted media'],
  vip: ['Unlimited AI chat', 'Highest priority', 'Dedicated chatter', '150 daily diamond bonus', 'Media discounts', 'Exclusive content', 'VIP badge ✨'],
};

const Billing = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentTier, setCurrentTier] = useState<TierKey>('free');
  const [gemBalance, setGemBalance] = useState(0);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) return;
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      if (data?.subscribed) {
        setCurrentTier((data.tier as TierKey) || 'basic');
        setSubscriptionEnd(data.subscription_end);
      } else {
        setCurrentTier('free');
        setSubscriptionEnd(null);
      }
    } catch (e) {
      console.error('Check subscription error:', e);
    } finally {
      setCheckingSubscription(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    checkSubscription();
    // Load gem balance
    supabase.from('gem_wallets').select('balance').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setGemBalance(data.balance);
    });
  }, [user, checkSubscription]);

  // Check after Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Checking subscription...');
      setTimeout(checkSubscription, 2000);
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Payment canceled.');
    }
  }, [searchParams, checkSubscription]);

  // Auto refresh every minute
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const handleSubscribe = async (tierKey: TierKey) => {
    const tier = TIERS[tierKey];
    if (!tier.price_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.price_id, mode: 'subscription' },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyGems = async (priceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, mode: 'payment' },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to open portal');
    } finally {
      setLoading(false);
    }
  };

  const tierKeys: TierKey[] = ['free', 'basic', 'premium', 'vip'];

  return (
    <div className="p-6 md:p-8 space-y-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Choose Your <span className="text-gradient-primary">Plan</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Start free, upgrade anytime. Cancel whenever you want.
        </p>

        {/* Current status */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
            <Crown className="h-4 w-4" />
            {TIERS[currentTier].name} Plan
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-border text-foreground text-sm font-medium">
         <Diamond className="h-4 w-4 text-primary" />
            {gemBalance} Diamonds
          </div>
          {subscriptionEnd && (
            <span className="text-xs text-muted-foreground">
              Renews {new Date(subscriptionEnd).toLocaleDateString()}
            </span>
          )}
        </div>
      </motion.div>

      {/* Subscription Tiers */}
      <div className="grid md:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {tierKeys.map((key, i) => {
          const tier = TIERS[key];
          const Icon = tierIcons[key];
          const isCurrent = key === currentTier;
          const isHighlight = key === 'premium';

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-6 border relative flex flex-col ${
                isHighlight ? 'border-primary bg-primary/5 glow-primary' : 'border-border bg-card'
              }`}
            >
              {isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full border border-border">
                  Your Plan
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
              {isCurrent ? (
                <div className="space-y-2">
                  <Button className="w-full bg-secondary text-secondary-foreground" disabled>
                    Current Plan
                  </Button>
                  {key !== 'free' && (
                    <Button variant="outline" className="w-full text-xs" onClick={handleManageSubscription} disabled={loading}>
                      Manage Subscription
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className={`w-full ${isHighlight ? 'btn-premium text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  disabled={key === 'free' || loading}
                  onClick={() => handleSubscribe(key)}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Gem Store */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            <Diamond className="inline h-6 w-6 text-primary mr-2" />
            Diamond Store
          </h2>
          <p className="text-muted-foreground text-sm">
            Use diamonds for AI images, voice messages, premium content, and more.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {DIAMOND_BUNDLES.map((bundle, i) => (
            <motion.div
              key={bundle.diamonds}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="rounded-2xl p-6 border border-border bg-card text-center hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Diamond className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{bundle.diamonds}</h3>
              <p className="text-sm text-muted-foreground mb-4">Diamonds</p>
              <Button
                className="w-full btn-premium text-primary-foreground"
                onClick={() => handleBuyGems(bundle.price_id)}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : bundle.price}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Refresh */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={checkSubscription}
          disabled={checkingSubscription}
          className="text-muted-foreground text-xs"
        >
          {checkingSubscription ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
          Refresh Subscription Status
        </Button>
      </div>
    </div>
  );
};

export default Billing;
