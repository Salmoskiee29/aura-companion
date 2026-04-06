import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Camera, Heart, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoImg from '@/assets/yourmatch-logo.png';

const interestOptions = [
  'Deep Conversations', 'Flirty Chat', 'Emotional Support',
  'Roleplay', 'Casual Talk', 'Adventure Stories',
  'Poetry & Art', 'Gaming Talk', 'Music & Movies',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(user?.displayName || '');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 5;

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // Auto-save after each step transition (debounced)
  const autoSave = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({
          nickname: nickname || user.displayName,
          interests,
        })
        .eq('user_id', user.id);
    } catch {
      // Silent auto-save — errors handled at finish
    }
  }, [user, nickname, interests]);

  // Auto-save when step changes (except step 0 and final)
  useEffect(() => {
    if (step > 0 && step < 4) {
      const timeout = setTimeout(autoSave, 500);
      return () => clearTimeout(timeout);
    }
  }, [step, autoSave]);

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: nickname || user.displayName,
          interests,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      
      // Refresh user state and wait for it to propagate
      await refreshUser();
      
      // Small delay to ensure state propagation before navigation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast.success("You're all set! Let's go 🎉");
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Onboarding finish error:', err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div key="welcome" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <img src={logoImg} alt="YourMatch" className="h-12 w-12 rounded-xl" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-3">Welcome to YourMatch</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your personal AI companion platform. Let's set up your profile so we can find your perfect match.
              </p>
              <Button onClick={() => setStep(1)} className="btn-premium text-primary-foreground px-10 py-6 text-base rounded-full">
                Let's Go <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Nickname */}
          {step === 1 && (
            <motion.div key="nickname" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">What should we call you?</h2>
              <p className="text-muted-foreground mb-6">Pick a nickname that your companions will use.</p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname..."
                className="w-full bg-secondary border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-lg mb-6"
                maxLength={20}
              />
            </motion.div>
          )}

          {/* Step 2: Profile photo (optional) */}
          {step === 2 && (
            <motion.div key="photo" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Camera className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Add a profile photo</h2>
              <p className="text-muted-foreground mb-6">Optional — you can always add one later in settings.</p>
              <div className="w-32 h-32 rounded-full bg-secondary border-2 border-dashed border-border mx-auto flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">Tap to upload (coming soon)</p>
            </motion.div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <motion.div key="interests" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">What are you into?</h2>
              <p className="text-muted-foreground mb-6">Select your interests so we can match you better.</p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      interests.includes(interest)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <motion.div key="finish" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-3">You're all set!</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your profile is ready. Time to meet your perfect companion.
              </p>
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="btn-premium text-primary-foreground px-10 py-6 text-base rounded-full"
              >
                {saving ? 'Saving...' : 'Start Chatting'}
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && step < 4 && (
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(s => s + 1)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="flex justify-center mt-4">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
