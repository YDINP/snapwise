'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface RevealTitleStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function RevealTitleStep({ step, card, isActive }: RevealTitleStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  // Parse content: filter out lines that duplicate card emoji/title
  const lines = step.content.split('\n').filter((l: string) => {
    const trimmed = l.trim();
    if (!trimmed) return false;
    const stripped = trimmed.replace(/^[^\w가-힣]*/, '').trim();
    if (stripped === card.title || stripped === `${card.emoji} ${card.title}`) return false;
    if (trimmed === card.emoji || trimmed === card.title) return false;
    return true;
  });
  const description = lines.join('\n');

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6">
        {/* ── Title ── with accent decorative lines */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-px w-8 origin-right"
            style={{ backgroundColor: categoryInfo.accent }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center text-2xl font-black text-white"
            style={{ wordBreak: 'keep-all' }}
          >
            {card.emoji} {card.title}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-px w-8 origin-left"
            style={{ backgroundColor: categoryInfo.accent }}
          />
        </div>

        {/* Square image frame — between title and description */}
        {card.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.6, type: 'spring', damping: 18 }}
            className="relative"
          >
            <div
              className="h-44 w-44 overflow-hidden rounded-2xl shadow-2xl"
              style={{ border: `3px solid ${categoryInfo.accent}60` }}
            >
              <img
                src={card.coverImage}
                alt={card.title}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Subtle glow behind frame */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl blur-2xl"
              style={{ backgroundColor: `${categoryInfo.accent}15` }}
            />
          </motion.div>
        )}

        {/* Description with accent-colored bold */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: card.coverImage ? 0.45 : 0.35, duration: 0.5 }}
            className="max-w-xs text-center text-base leading-relaxed text-white/80"
            style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
          >
            {renderWithLineBreaks(description, categoryInfo.accent)}
          </motion.p>
        )}
      </div>
    </div>
  );
}
