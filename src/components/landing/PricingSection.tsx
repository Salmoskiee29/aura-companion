import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    features: ['10 diamonds to start', 'AI chat (diamond-based)', '1 character slot', 'AI image generation', 'Basic priority'],
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: '/mo',
    features: ['Unlimited AI chat', '50 daily diamonds', 'Unlimited characters', 'More image generations', 'Faster AI responses', 'Extended chat memory'],
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground text-lg mb-14 max-w-xl mx-auto">Start free. Upgrade when you need more.</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 border transition-all ${plan.highlight ? 'border-primary/40 bg-primary/5 glow-primary' : 'border-border bg-card'}`}
            >
              {plan.highlight && (
                <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full mb-4">
                  Recommended
                </span>
              )}
              <h3 className="text-xl font-semibold text-foreground mb-2 font-sans">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                {plan.highlight ? (
                  <button className="w-full py-3 rounded-full btn-premium text-primary-foreground font-semibold">Get Premium</button>
                ) : (
                  <button className="w-full py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors">Start Free</button>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
