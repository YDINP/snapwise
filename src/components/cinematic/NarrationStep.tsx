'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface NarrationStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function NarrationStep({ step, card, isActive }: NarrationStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const lines = step.content.split('\n').filter(l => l.trim());

  // Adaptive font size
  const fontSize = lines.length <= 4
    ? 'text-lg md:text-xl'
    : lines.length <= 7
      ? 'text-base md:text-lg'
      : 'text-sm md:text-base';

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Glass card with accent borders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mx-6 max-w-sm"
      >
        {/* Top accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-4 h-0.5 w-10 origin-center rounded-full"
          style={{ backgroundColor: categoryInfo.accent }}
        />

        {/* Text content */}
        <p
          className={`text-center ${fontSize} font-medium leading-relaxed text-white/90`}
          style={{ wordBreak: 'keep-all', textWrap: 'balance', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
        >
          {renderWithLineBreaks(step.content, categoryInfo.accent)}
        </p>

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-4 h-0.5 w-10 origin-center rounded-full"
          style={{ backgroundColor: categoryInfo.accent }}
        />
      </motion.div>
    </div>
  );
}
