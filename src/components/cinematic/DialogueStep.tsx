'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import TypingText from '@/components/cinematic/TypingText';

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
    <div className="relative flex h-full w-full items-center overflow-hidden px-5">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Content container */}
      <div className="relative z-10 flex w-full flex-col items-start gap-3">
        {/* Character row: avatar + name badge */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          {character.image ? (
            <div
              className="h-14 w-14 overflow-hidden rounded-full shadow-lg"
              style={{ border: `3px solid ${categoryInfo.accent}` }}
            >
              <img src={character.image} alt={character.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${categoryInfo.accent}40, ${categoryInfo.accent}20)`,
                border: `3px solid ${categoryInfo.accent}80`,
              }}
            >
              {character.emoji}
            </div>
          )}
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: `${categoryInfo.accent}90` }}
          >
            {character.name}
          </span>
        </motion.div>

        {/* Comic speech bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={isActive ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5, type: 'spring', damping: 20 }}
          className="relative ml-4 w-full"
          style={{ maxWidth: 'calc(100% - 16px)' }}
        >
          {/* Tail — comic-style triangle pointing up-left toward character */}
          <div
            className="absolute -top-2 left-6"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '10px solid rgba(255,255,255,0.95)',
              filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.08))',
            }}
          />

          {/* Bubble body */}
          <div
            className="relative rounded-2xl px-5 py-4"
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.15), 0 0 0 2px ${categoryInfo.accent}20`,
              minHeight: '72px',
            }}
          >
            <p
              className="text-sm font-medium leading-relaxed text-gray-800"
              style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
            >
              <TypingText text={step.content} isActive={isActive} />
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
