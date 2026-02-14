import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const AgeGateContext = createContext<{ verified: boolean }>({ verified: false });

export function useAgeGate() {
  return useContext(AgeGateContext);
}

export function AgeGateProvider({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(() => {
    return localStorage.getItem('lumiere_age_verified') === 'true';
  });

  const handleEnter = () => {
    localStorage.setItem('lumiere_age_verified', 'true');
    setVerified(true);
  };

  const handleExit = () => {
    window.location.href = 'https://google.com';
  };

  return (
    <AgeGateContext.Provider value={{ verified }}>
      <AnimatePresence>
        {!verified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            {/* Ambient glow background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px] animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 w-full max-w-md mx-4"
            >
              <div className="glass-card rounded-3xl p-10 text-center border border-border/50 shadow-2xl">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="h-8 w-8 text-primary" />
                </div>

                <h1 className="text-2xl font-display font-bold text-foreground mb-3">
                  Age Verification Required
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  This website contains adult-oriented content.<br />
                  You must be <span className="text-foreground font-semibold">18 years or older</span> to enter.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleEnter}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base glow-primary hover:brightness-110 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Enter — I am 18+
                  </button>
                  <button
                    onClick={handleExit}
                    className="w-full py-3 rounded-2xl bg-secondary text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
                  >
                    Exit
                  </button>
                </div>

                <p className="text-xs text-muted-foreground/60 mt-6">
                  By entering, you confirm you are of legal age in your jurisdiction.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {verified && children}
    </AgeGateContext.Provider>
  );
}
