import { motion } from 'framer-motion';

export function FeaturedSection() {
  return (
    <section className="py-10 border-y border-border bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Featured In:</span>
          {['TechCrunch', 'Forbes', 'Wired', 'The Verge'].map((name) => (
            <span key={name} className="text-xl md:text-2xl font-display font-bold text-muted-foreground/40 tracking-wide">
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
