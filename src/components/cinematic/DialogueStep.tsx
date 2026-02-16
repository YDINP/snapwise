'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface DialogueStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function DialogueStep({ step, card, isActive }: DialogueStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  // Find character by characterId — fallback to prevent black screen
  const character = card.characters?.find(c => c.id === step.characterId)
    ?? { id: 'unknown', name: '화자', emoji: '💬' };

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
          {character.image ? (
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-lg">
              <img src={character.image} alt={character.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-4xl backdrop-blur-sm">
              {character.emoji}
            </div>
          )}
          <span className="text-xs font-bold text-white/80">{character.name}</span>
        </motion.div>

        {/* Speech bubble — comic style */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          className="relative flex-1"
          style={{ maxWidth: '80%' }}
        >
          {/* Bubble tail */}
          <div className="absolute left-0 top-4 h-0 w-0 -translate-x-2 border-r-[10px] border-t-[10px] border-b-[10px] border-r-white/90 border-t-transparent border-b-transparent" />

          {/* Bubble content */}
          <div className="rounded-xl rounded-tl-sm border-2 border-white bg-white/90 p-4 shadow-lg">
            <p className="text-sm leading-relaxed text-gray-900">
              {renderWithLineBreaks(step.content)}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
