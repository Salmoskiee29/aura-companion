import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Shield, Sparkles } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { mockModels } from '@/data/models';
import { ModelCard } from '@/components/models/ModelCard';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">Lumière</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/auth?mode=login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=signup">
              <button className="px-5 py-2 rounded-full btn-premium text-primary-foreground text-sm font-semibold">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background with overlays */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        </div>

        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30 particle"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${5 + i}s`,
              }}
            />
          ))}
          <div className="absolute top-1/3 left-1/6 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/3 right-1/6 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              ✨ Your AI Companion Awaits
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-6 leading-[1.1]">
              Find Your Perfect<br />
              <span className="text-gradient-primary">Connection</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience intimate, meaningful conversations with AI companions crafted to understand and connect with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <button className="px-10 py-4 rounded-full btn-premium text-primary-foreground text-lg font-semibold">
                  Start Chatting Now
                  <Sparkles className="inline ml-2 h-5 w-5" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Model preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-24 flex justify-center gap-4 overflow-hidden"
          >
            {mockModels.slice(0, 3).map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="w-44 md:w-56"
              >
                <div className="rounded-2xl overflow-hidden glow-card bg-card">
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
      <section className="py-28 bg-background relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/3 blur-[150px] rounded-full" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
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
              Premium AI companions designed for genuine connection.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Heart, title: 'Authentic Personalities', desc: 'Each companion has unique traits, interests, and conversation styles that feel genuine and intimate.' },
              { icon: MessageCircle, title: 'Natural Conversations', desc: 'Advanced AI creates responses that flow naturally with realistic timing and emotional depth.' },
              { icon: Shield, title: 'Private & Secure', desc: 'Your conversations are encrypted and completely private. Your data is never shared with anyone.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 text-center glow-card"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
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
      <section className="py-28 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Simple Pricing
          </h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-xl mx-auto">Start free, upgrade when you&apos;re ready.</p>
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
                className={`rounded-2xl p-8 border transition-all duration-300 ${plan.highlight ? 'border-primary/40 bg-primary/5 glow-primary' : 'border-border bg-card glow-card'}`}
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
                  {plan.highlight ? (
                    <button className="w-full py-3 rounded-full btn-premium text-primary-foreground font-semibold">
                      Get Premium
                    </button>
                  ) : (
                    <button className="w-full py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors">
                      Get Started
                    </button>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-background">
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
