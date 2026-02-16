'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface NarrationStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function NarrationStep({ step, card, isActive }: NarrationStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Narrator text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 max-w-xs px-6"
      >
        <p
          className="text-center text-base font-light italic text-white/90"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
        >
          {step.content}
        </p>
      </motion.div>
    </div>
  );
}
