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
      <div className="relative z-10 flex w-full items-start gap-3">
        {/* Character avatar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-shrink-0 flex-col items-center gap-2"
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

        {/* Speech bubble — SVG-based comic style */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          className="relative flex-1"
          style={{ maxWidth: '80%' }}
        >
          {/* SVG speech bubble background */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 300 150"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20,5 Q5,5 5,20 L5,120 Q5,135 20,135 L30,135 L15,148 L40,135 L280,135 Q295,135 295,120 L295,20 Q295,5 280,5 Z"
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(255,255,255,1)"
              strokeWidth="2"
            />
          </svg>

          {/* Text content */}
          <div className="relative z-10 px-5 py-4">
            <p className="text-sm font-medium leading-relaxed text-gray-800">
              {renderWithLineBreaks(step.content)}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
