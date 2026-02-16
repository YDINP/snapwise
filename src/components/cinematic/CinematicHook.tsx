'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface CinematicHookProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function CinematicHook({ step, card, isActive }: CinematicHookProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6">
        {/* Large emoji with float animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isActive ? {
            opacity: 1,
            scale: 1,
            y: [0, -10, 0]
          } : {}}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5, type: 'spring' },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
          className="text-8xl"
        >
          {card.emoji}
        </motion.div>

        {/* Short narration text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-xs text-center text-lg font-medium text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          {step.content}
        </motion.p>
      </div>

      {/* Pulsing CTA at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{
          delay: 0.6,
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-12 text-sm text-white/80"
      >
        탭하여 시작 →
      </motion.div>
    </div>
  );
}
