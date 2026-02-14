import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '',
    description: 'Try it out with 5 free messages',
    features: ['5 messages total', '1 companion', 'Basic chat experience'],
    icon: Sparkles,
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$14.99',
    period: '/mo',
    description: 'Unlimited conversations with all companions',
    features: ['Unlimited messages', 'All companions', 'Priority response speed', 'Image sharing', 'Chat history'],
    icon: Crown,
    highlight: true,
  },
  {
    name: 'VIP',
    price: '$29.99',
    period: '/mo',
    description: 'The ultimate experience',
    features: ['Everything in Premium', 'Exclusive companions', 'Voice messages', 'Custom personalities', 'Priority support', 'Early access to new features'],
    icon: Zap,
    highlight: false,
  },
];

const Billing = () => {
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
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
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
              <Button className={`w-full py-5 ${
                plan.highlight
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
                {plan.price === '$0' ? 'Current Plan' : 'Subscribe'}
              </Button>
            </motion.div>
          ))}
        </div>
    </div>
  );
};

export default Billing;
