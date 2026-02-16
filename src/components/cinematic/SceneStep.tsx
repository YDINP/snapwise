'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface SceneStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function SceneStep({ step, card, isActive }: SceneStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Centered text */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full px-8"
      >
        <p className="text-center text-lg font-medium text-white">
          {renderWithLineBreaks(step.content)}
        </p>
      </motion.div>
    </div>
  );
}
