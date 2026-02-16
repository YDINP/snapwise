'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface SceneStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function SceneStep({ step, card, isActive }: SceneStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative flex h-full w-full items-end overflow-hidden pb-20">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Subtitle-style text at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full px-8"
      >
        <p className="text-center text-lg font-medium text-white">
          {step.content}
        </p>
      </motion.div>
    </div>
  );
}
