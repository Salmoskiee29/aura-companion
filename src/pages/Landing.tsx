import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, Sun, Moon, Globe, Bot, Palette, Wand2, ChevronDown, ArrowRight, Shield, Zap } from 'lucide-react';
import logoImg from '@/assets/yourmatch-logo.png';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languageNames, availableLanguages, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="YourMatch" className="h-6 w-6 rounded" />
            <span className="text-xl font-display font-bold text-foreground">YourMatch</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/auth?mode=login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.login')}</Link>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? 'bg-primary/10 text-primary' : ''}>
                    {languageNames[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link to="/auth?mode=signup">
              <button className="px-5 py-2 rounded-full btn-premium text-primary-foreground text-sm font-semibold">
                {t('nav.getStarted')}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-primary/30 particle" style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 1.2}s`, animationDuration: `${5 + i}s` }} />
          ))}
          <div className="absolute top-1/3 left-[15%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/3 right-[15%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              ✨ AI-Powered Character Platform
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-6 leading-[1.1]">
              Create & Chat With<br />
              <span className="text-gradient-primary">AI Characters</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Design unique AI companions with custom personalities, generate stunning avatars, and have dynamic conversations — all powered by advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <button className="px-10 py-4 rounded-full btn-premium text-primary-foreground text-lg font-semibold">
                  Start Creating Free
                  <Sparkles className="inline ml-2 h-5 w-5" />
                </button>
              </Link>
              <a href="#features">
                <button className="px-10 py-4 rounded-full bg-secondary text-secondary-foreground text-lg font-medium hover:bg-muted transition-colors border border-border">
                  See Features
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
              </a>
            </div>
          </motion.div>

          {/* Feature preview cards */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="mt-24 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Bot, label: 'Chat with AI', desc: 'Dynamic conversations' },
              { icon: Palette, label: 'Generate Avatars', desc: 'AI image creation' },
              { icon: Wand2, label: 'Custom Personalities', desc: 'Design unique traits' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.15 }} className="rounded-2xl p-5 glass-card glow-card text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 bg-background relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/3 blur-[150px] rounded-full" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Create, customize, and interact with AI characters like never before.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: MessageCircle, title: 'AI Chat', desc: 'Have natural, dynamic conversations with AI characters powered by advanced language models. Each character has a unique personality.' },
              { icon: Palette, title: 'AI Image Generation', desc: 'Generate stunning character portraits using AI. Describe your character and watch them come to life with beautiful avatars.' },
              { icon: Wand2, title: 'Custom Characters', desc: 'Create your own AI companions with custom names, personalities, tones, and backstories. Make them truly yours.' },
              { icon: Bot, title: 'Public Models', desc: 'Browse and chat with pre-made AI companions created by our team — each with unique personalities and stories.' },
              { icon: Shield, title: 'Privacy First', desc: 'Your conversations and characters are private. Only you can access your custom creations and chat history.' },
              { icon: Zap, title: 'Premium Experience', desc: 'Upgrade for unlimited chats, more character slots, additional image generations, and priority AI responses.' },
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card rounded-2xl p-7 glow-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-sans">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Three simple steps to start chatting with your own AI character.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Your Character', desc: 'Define a name, personality, and tone. Write a custom prompt to shape how your character behaves.' },
              { step: '02', title: 'Generate an Avatar', desc: 'Use our AI image generator to create a unique portrait. Pick your favorite from multiple options.' },
              { step: '03', title: 'Start Chatting', desc: 'Your character is ready! Have dynamic AI-powered conversations anytime, from any device.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 relative">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-sans">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 relative bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-xl mx-auto">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: '', features: ['10 diamonds to start', 'AI chat (diamond-based)', '1 character slot', 'AI image generation', 'Basic priority'], highlight: false },
              { name: 'Premium', price: '$19.99', period: '/mo', features: ['Unlimited AI chat', '50 daily diamonds', 'Unlimited characters', 'More image generations', 'Faster AI responses', 'Extended chat memory'], highlight: true },
            ].map((plan) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`rounded-2xl p-8 border transition-all duration-300 ${plan.highlight ? 'border-primary/40 bg-primary/5 glow-primary' : 'border-border bg-card glow-card'}`}>
                {plan.highlight && (
                  <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full mb-4">Recommended</span>
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

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="YourMatch" className="h-5 w-5 rounded" />
              <span className="font-display font-bold text-foreground">YourMatch</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('footer.rights')}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  {languageNames[language]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? 'bg-primary/10 text-primary' : ''}>
                    {languageNames[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ─── FAQ Component ─── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: 'What is YourMatch.ai?', a: 'YourMatch.ai is an AI character interaction platform. You can chat with pre-made AI companions or create your own custom characters with unique personalities and AI-generated avatars.' },
    { q: 'How does AI chat work?', a: 'Each character has a unique personality prompt. When you send a message, our AI generates a response based on that personality — creating natural, dynamic conversations.' },
    { q: 'Can I create my own characters?', a: 'Yes! You can create custom AI characters by defining their name, personality, and tone. You can also generate AI portraits for them.' },
    { q: 'Is my data private?', a: 'Absolutely. Your conversations and custom characters are private to your account. We do not share your data with third parties.' },
    { q: 'What\'s included in Premium?', a: 'Premium gives you unlimited AI chats, 50 daily diamonds, unlimited character creation, more image generations, and faster AI response priority.' },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">FAQ</h2>
        </motion.div>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl text-left hover:border-primary/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 pb-4 pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Landing;
