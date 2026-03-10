import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle } from 'lucide-react';
import heroImg from '@/assets/hero-characters.jpg';

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Left content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="pt-24 lg:pt-0"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1] mb-6">
              AI CHARACTER APP<br />
              <span className="text-gradient-primary">THAT WORKS</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              <span className="text-primary font-semibold">YourMatch.ai app:</span> The smartest AI character generator.
              Custom personalities, avatars and more.
              <br />
              What are you waiting for?{' '}
              <Link to="/auth?mode=signup" className="text-primary hover:underline font-medium">
                Try it for FREE!
              </Link>
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth?mode=signup">
                <button className="px-8 py-3.5 rounded-full btn-premium text-primary-foreground font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Create AI Character
                </button>
              </Link>
              <Link to="/auth?mode=signup">
                <button className="px-8 py-3.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Start Chatting
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right hero image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex justify-end"
          >
            <img
              src={heroImg}
              alt="AI Characters"
              className="w-full max-w-xl object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
