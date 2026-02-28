'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { parseInline } from '@/lib/renderContent';

interface SplashStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/**
 * Splash Step — Manga splash page style emphasis.
 * Speed lines radiate from center, big dramatic text with shake/pulse.
 * First line = hero text (large), rest = supporting text.
 */
export default function SplashStep({ step, card, isActive }: SplashStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const lines = step.content.split('\n').filter(l => l.trim());

  // First line is the hero (big & dramatic), rest are supporting
  const heroLine = lines[0]?.trim() ?? '';
  const supportLines = lines.slice(1).map(l => l.trim()).filter(Boolean);

  // Check if hero starts with emoji
  const emojiMatch = heroLine.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
  const heroEmoji = emojiMatch?.[1] ?? '';
  const heroText = heroEmoji ? heroLine.slice(emojiMatch![0].length) : heroLine;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Pure black background */}
      <div className="absolute inset-0 bg-black" />

      {/* Speed lines — radiating from center */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15) + 7.5;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={isActive ? { opacity: [0, 0.15, 0.08], scaleY: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.05 + i * 0.02,
                ease: 'easeOut',
              }}
              className="absolute left-1/2 top-1/2 origin-bottom"
              style={{
                width: '2px',
                height: '150%',
                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                background: `linear-gradient(to top, ${categoryInfo.accent}30, transparent 70%)`,
              }}
            />
          );
        })}
      </div>

      {/* Central radial burst */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={isActive ? { opacity: 1, scale: [0.3, 1.2, 1] } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute"
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${categoryInfo.accent}25 0%, ${categoryInfo.accent}08 40%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6">
        {/* Hero emoji — big bounce */}
        {heroEmoji && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isActive ? { opacity: 1, scale: [0, 1.3, 1] } : {}}
            transition={{ duration: 0.5, ease: 'backOut', delay: 0.1 }}
            className="text-5xl"
          >
            {heroEmoji}
          </motion.div>
        )}

        {/* Hero text — large, dramatic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={isActive ? { opacity: 1, scale: [0.7, 1.05, 1] } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          <p
            className="text-center text-2xl font-black leading-tight text-white md:text-3xl"
            style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
          >
            {parseInline(heroText, categoryInfo.accent)}
          </p>
        </motion.div>

        {/* Supporting lines */}
        {supportLines.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            {supportLines.map((line, i) => {
              const isDivider = /^[─━—-]{2,}$/.test(line);
              if (isDivider) {
                return (
                  <motion.div
                    key={i}
                    initial={{ scaleX: 0 }}
                    animate={isActive ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                    className="my-1 h-px w-12 bg-white/20"
                  />
                );
              }
              return (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isActive ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.1, ease: 'easeOut' }}
                  className="text-center text-base font-bold leading-snug text-white/80 md:text-lg"
                  style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
                >
                  {parseInline(line, categoryInfo.accent)}
                </motion.p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
