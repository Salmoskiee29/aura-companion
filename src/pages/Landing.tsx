import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
import { mockModels } from '@/data/models';
import { ModelCard } from '@/components/models/ModelCard';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">Lumière</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/models" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Models</Link>
            <Link to="/billing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log in</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              ✨ Your AI Companion Awaits
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect<br />
              <span className="text-gradient-primary">Connection</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Experience meaningful conversations with AI companions crafted to understand, support, and connect with you on a deeper level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow-primary">
                  Start Free Trial
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/models">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary px-8 py-6 text-lg">
                  Browse Models
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Model preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 flex justify-center gap-4 overflow-hidden"
          >
            {mockModels.slice(0, 3).map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="w-48 md:w-56"
              >
                <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
                  <img src={model.avatar} alt={model.name} className="w-full aspect-[3/4] object-cover" />
                  <div className="p-3 text-center">
                    <p className="font-semibold text-foreground text-sm">{model.name}, {model.age}</p>
                    <p className="text-xs text-muted-foreground">{model.nationality}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient-primary">Lumière</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Premium AI companions designed for genuine emotional connection.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Heart, title: 'Authentic Personalities', desc: 'Each companion has unique traits, interests, and conversation styles that feel genuine.' },
              { icon: MessageCircle, title: 'Natural Conversations', desc: 'Advanced AI creates responses that flow naturally with realistic timing and emotion.' },
              { icon: Shield, title: 'Private & Secure', desc: 'Your conversations are encrypted and completely private. Your data is never shared.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-2xl p-8 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 font-sans">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Simple Pricing
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">Start free, upgrade when you're ready.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Free Trial', price: '$0', period: '', features: ['5 free messages', '1 companion', 'Basic chat'], highlight: false },
              { name: 'Premium', price: '$14.99', period: '/mo', features: ['Unlimited messages', 'All companions', 'Priority responses', 'Image sharing'], highlight: true },
              { name: 'VIP', price: '$29.99', period: '/mo', features: ['Everything in Premium', 'Exclusive companions', 'Voice messages', 'Custom personalities'], highlight: false },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-8 border ${plan.highlight ? 'border-primary bg-primary/5 glow-primary' : 'border-border bg-card'}`}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2 font-sans">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button className={`w-full ${plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {plan.highlight ? 'Get Premium' : 'Get Started'}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">Lumière</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Lumière. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
