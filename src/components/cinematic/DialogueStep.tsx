'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import TypingText from '@/components/cinematic/TypingText';
import { slideInLeft, slideInRight, scaleIn } from '@/lib/motionVariants';

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

  // 캐릭터 배열 내 인덱스로 좌/우 방향 결정
  // index 0 = 왼쪽 캐릭터, 1 이상 = 오른쪽/내레이터
  const characterIndex = card.characters?.findIndex(c => c.id === step.characterId) ?? 0;
  const isLeft = characterIndex === 0;

  const bubbleVariant = isLeft ? slideInLeft : slideInRight;

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden px-5">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Content container */}
      <div className="relative z-10 flex w-full flex-col items-start gap-3">
        {/* Character row: avatar + name badge */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="flex items-center gap-3"
        >
          {/* 캐릭터 아바타: scaleIn으로 강조 등장 */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
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
          </motion.div>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: `${categoryInfo.accent}90` }}
          >
            {character.name}
          </span>
        </motion.div>

        {/* Comic speech bubble — 방향별 slideIn */}
        <motion.div
          variants={bubbleVariant}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          transition={{ delay: 0.15 }}
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
            className="relative rounded-2xl px-6 py-5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.15), 0 0 0 2px ${categoryInfo.accent}20`,
              minHeight: '72px',
            }}
          >
            <p
              className="font-medium text-gray-800"
              style={{
                fontSize: 'var(--card-text-body)',
                lineHeight: 'var(--card-line-height)',
                wordBreak: 'keep-all',
              }}
            >
              <TypingText text={step.content} isActive={isActive} />
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
