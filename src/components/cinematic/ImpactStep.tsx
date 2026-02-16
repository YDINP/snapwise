'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface ImpactStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function ImpactStep({ step, card, isActive }: ImpactStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Category gradient background with dark overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-black/90" />

      {/* Dramatic text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{
          duration: 0.7,
          type: 'spring',
          stiffness: 150,
          damping: 20
        }}
        className="relative z-10 px-8"
      >
        <h2
          className="text-center text-3xl font-black text-white md:text-4xl"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
          }}
        >
          {step.content}
        </h2>
      </motion.div>
    </div>
  );
}
