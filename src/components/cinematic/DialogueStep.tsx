'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface DialogueStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function DialogueStep({ step, card, isActive }: DialogueStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  // Find character by characterId
  const character = card.characters?.find(c => c.id === step.characterId);

  if (!character) {
    return null;
  }

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden px-6">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Content container */}
      <div className="relative z-10 flex w-full items-start gap-4">
        {/* Character avatar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm">
            {character.emoji}
          </div>
          <span className="text-xs text-white/60">{character.name}</span>
        </motion.div>

        {/* Speech bubble */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          className="relative flex-1"
        >
          {/* Bubble tail */}
          <div className="absolute left-0 top-4 h-0 w-0 -translate-x-2 border-r-8 border-t-8 border-b-8 border-r-white/15 border-t-transparent border-b-transparent" />

          {/* Bubble content */}
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-md">
            <p className="text-sm leading-relaxed text-white/90">
              {step.content}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
