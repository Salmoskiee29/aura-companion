import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import amaraImg from '@/assets/models/amara.jpg';
import emmaImg from '@/assets/models/emma.jpg';
import isabellaImg from '@/assets/models/isabella.jpg';
import laylaImg from '@/assets/models/layla.jpg';
import sophiaImg from '@/assets/models/sophia.jpg';
import yukiImg from '@/assets/models/yuki.jpg';

const characters = [
  { name: 'Amara', img: amaraImg, trait: 'Adventurous & Bold' },
  { name: 'Emma', img: emmaImg, trait: 'Sweet & Caring' },
  { name: 'Isabella', img: isabellaImg, trait: 'Mysterious & Witty' },
  { name: 'Layla', img: laylaImg, trait: 'Passionate & Creative' },
  { name: 'Sophia', img: sophiaImg, trait: 'Elegant & Charming' },
  { name: 'Yuki', img: yukiImg, trait: 'Playful & Energetic' },
];

export function MeetCharactersSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            MEET OUR BEST <span className="text-gradient-primary">AI CHARACTERS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {characters.map((char, i) => (
            <motion.div
              key={char.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to="/auth?mode=signup" className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border border-border bg-card">
                  <img
                    src={char.img}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-semibold text-foreground text-sm">{char.name}</p>
                    <p className="text-[11px] text-muted-foreground">{char.trait}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/auth?mode=signup">
            <button className="px-8 py-3 rounded-full btn-premium text-primary-foreground font-semibold inline-flex items-center gap-2">
              Explore All Characters
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
