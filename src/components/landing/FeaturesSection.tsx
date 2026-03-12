import { motion } from 'framer-motion';
import { MessageCircle, Palette, Wand2, Bot, Shield, Zap } from 'lucide-react';

const features = [
  { icon: MessageCircle, title: 'AI Chat', desc: 'Have natural, dynamic conversations with AI characters powered by advanced language models.' },
  { icon: Palette, title: 'AI Image Generation', desc: 'Generate stunning character portraits using AI. Describe your character and watch them come to life.' },
  { icon: Wand2, title: 'Custom Characters', desc: 'Create your own AI companions with custom names, personalities, tones, and backstories.' },
  { icon: Bot, title: 'Public Models', desc: 'Browse and chat with pre-made AI companions — each with unique personalities and stories.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your conversations and characters are private. Only you can access your custom creations.' },
  { icon: Zap, title: 'Premium Experience', desc: 'Upgrade for unlimited chats, more character slots, additional image generations, and priority AI.' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything You <span className="text-gradient-primary">Need</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Create, customize, and interact with AI characters like never before.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-6 glass-card-strong glow-card group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2 font-sans">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
