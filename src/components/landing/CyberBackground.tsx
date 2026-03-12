import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const hearts = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + (i * 12) % 85}%`,
  top: `${15 + (i * 17) % 70}%`,
  size: 12 + (i % 3) * 6,
  delay: i * 1.5,
  duration: 10 + (i % 4) * 3,
}));

const glowOrbs = [
  { left: '15%', top: '20%', color: 'hsl(325 80% 58%)', size: 300 },
  { left: '75%', top: '60%', color: 'hsl(280 65% 55%)', size: 250 },
  { left: '50%', top: '80%', color: 'hsl(185 70% 55%)', size: 200 },
];

export function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient orbs */}
      {glowOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[120px] opacity-[0.06]"
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            background: orb.color,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating holographic hearts */}
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{ left: h.left, top: h.top }}
          animate={{
            y: [0, -60, -20, -80, 0],
            rotate: [0, 10, -8, 5, 0],
            opacity: [0.08, 0.2, 0.05, 0.15, 0.08],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart
            className="text-primary/20"
            size={h.size}
            strokeWidth={1}
            fill="currentColor"
          />
        </motion.div>
      ))}

      {/* Subtle scanlines overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            hsl(280 50% 60% / 0.3) 2px,
            hsl(280 50% 60% / 0.3) 4px
          )`,
        }}
      />
    </div>
  );
}
