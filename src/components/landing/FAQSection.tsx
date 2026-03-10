import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is YourMatch.ai?', a: 'YourMatch.ai is an AI character interaction platform. You can chat with pre-made AI companions or create your own custom characters with unique personalities and AI-generated avatars.' },
  { q: 'How does AI chat work?', a: 'Each character has a unique personality prompt. When you send a message, our AI generates a response based on that personality — creating natural, dynamic conversations.' },
  { q: 'Can I create my own characters?', a: 'Yes! You can create custom AI characters by defining their name, personality, and tone. You can also generate AI portraits for them.' },
  { q: 'Is my data private?', a: 'Absolutely. Your conversations and custom characters are private to your account. We do not share your data with third parties.' },
  { q: "What's included in Premium?", a: 'Premium gives you unlimited AI chats, 50 daily diamonds, unlimited character creation, more image generations, and faster AI response priority.' },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
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
