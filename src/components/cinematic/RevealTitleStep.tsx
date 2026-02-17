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
      {/* Category gradient background with radial vignette */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        {/* Emoji with accent ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="relative"
        >
          {/* Accent ring behind emoji */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -inset-3 rounded-full"
            style={{
              background: `radial-gradient(circle, ${categoryInfo.accent}15 0%, transparent 70%)`,
            }}
          />
          <span className="relative text-6xl">{card.emoji}</span>
        </motion.div>

        {/* ── Title ── with accent decorative lines */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="h-px w-8 origin-right"
            style={{ backgroundColor: categoryInfo.accent }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center text-2xl font-black text-white"
            style={{ wordBreak: 'keep-all' }}
          >
            {card.title}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="h-px w-8 origin-left"
            style={{ backgroundColor: categoryInfo.accent }}
          />
        </div>

        {/* Description with accent-colored bold */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="max-w-xs text-center text-base leading-relaxed text-white/80"
            style={{ wordBreak: 'keep-all' }}
          >
            {renderWithLineBreaks(description, categoryInfo.accent)}
          </motion.p>
        )}
      </div>
    </div>
  );
}
