'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

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
        {/* Emoji with halo glow */}
        <div className="relative">
          {/* Halo glow behind emoji */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="h-28 w-28 rounded-full blur-2xl"
              style={{ backgroundColor: `${categoryInfo.accent}25` }}
            />
          </motion.div>

          {/* Floating emoji */}
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
            className="relative text-8xl"
          >
            {card.emoji}
          </motion.div>
        </div>

        {/* Short narration text with accent bold */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-xs text-center text-lg font-medium text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)', wordBreak: 'keep-all' }}
        >
          {renderWithLineBreaks(step.content, categoryInfo.accent)}
        </motion.p>
      </div>

      {/* Pulsing CTA at bottom with arrow bounce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: [0.4, 0.8, 0.4] } : {}}
        transition={{
          delay: 0.8,
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-12 flex items-center gap-1 text-sm text-white/70"
      >
        탭하여 시작
        <motion.span
          animate={isActive ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          →
        </motion.span>
      </motion.div>
    </div>
  );
}
