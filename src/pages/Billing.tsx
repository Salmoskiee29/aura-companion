import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatter } from '@/contexts/ChatterContext';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '',
    description: 'Try it out with 5 free messages',
    features: ['5 messages total', '1 companion', 'Basic chat experience'],
    icon: Sparkles,
    highlight: false,
    planId: 'free',
  },
  {
    name: 'Premium',
    price: '$14.99',
    period: '/mo',
    description: 'Unlimited conversations with all companions',
    features: ['Unlimited messages', 'All companions', 'Priority response speed', 'Image sharing', 'Chat history'],
    icon: Crown,
    highlight: true,
    planId: 'premium',
  },
  {
    name: 'VIP',
    price: '$29.99',
    period: '/mo',
    description: 'The ultimate experience',
    features: ['Everything in Premium', 'Exclusive companions', 'Voice messages', 'Custom personalities', 'Priority support', 'Early access to new features'],
    icon: Zap,
    highlight: false,
    planId: 'vip',
  },
];

const Billing = () => {
  const { subscription, subscribe, cancelSubscription } = useChatter();
  const navigate = useNavigate();

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') return;
    subscribe(planId);
    // Navigate to models so user can start chatting
    setTimeout(() => navigate('/dashboard/models'), 1500);
  };

  const isActive = subscription.status === 'active';

  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Choose Your <span className="text-gradient-primary">Plan</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Start free, upgrade anytime. Cancel whenever you want.
        </p>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium"
          >
            <Crown className="h-4 w-4" />
            Active: {subscription.plan?.charAt(0).toUpperCase()}{subscription.plan?.slice(1)} Plan
          </motion.div>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => {
          const isCurrent = (plan.planId === 'free' && !isActive) || (isActive && subscription.plan === plan.planId);

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 border relative ${
                plan.highlight
                  ? 'border-primary bg-primary/5 glow-primary'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <plan.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button
                  className="w-full py-5 bg-secondary text-secondary-foreground"
                  disabled={plan.planId === 'free'}
                  onClick={() => { if (isActive) cancelSubscription(); }}
                >
                  {isActive && plan.planId !== 'free' ? 'Cancel Plan' : 'Current Plan'}
                </Button>
              ) : (
                <Button
                  className={`w-full py-5 ${
                    plan.highlight
                      ? 'btn-premium text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  onClick={() => handleSubscribe(plan.planId)}
                  disabled={plan.planId === 'free'}
                >
                  {plan.planId === 'free' ? 'Current Plan' : 'Subscribe'}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Billing;
