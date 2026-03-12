import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Hero gradient background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
      
      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Glowing accent orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.08]"
        style={{ background: 'hsl(325 80% 58%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.06]"
        style={{ background: 'hsl(280 65% 55%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-strong mb-8"
            >
              <Heart className="h-3.5 w-3.5 text-primary" fill="currentColor" />
              <span className="text-xs font-medium text-primary tracking-wider uppercase">AI Companion Platform</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6 tracking-tight">
              Your Perfect
              <br />
              <span className="text-gradient-primary">AI Companion</span>
              <br />
              <span className="text-foreground/80 text-3xl md:text-5xl lg:text-5xl">Awaits You</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Create, customize, and connect with AI characters that understand you.
              Experience conversations that feel real, intimate, and truly personal.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup">
                <button className="px-8 py-3.5 rounded-full btn-premium text-primary-foreground font-semibold flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  Start Chatting
                </button>
              </Link>
              <Link to="/auth?mode=signup">
                <button className="px-8 py-3.5 rounded-full glass-card-strong text-foreground font-semibold hover:border-primary/30 transition-all flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Create Your AI Companion
                </button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-16 flex justify-center gap-8 md:gap-16"
            >
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '1M+', label: 'Messages Sent' },
                { value: '∞', label: 'Possibilities' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
