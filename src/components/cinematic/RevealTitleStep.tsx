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
    // Remove line if it's just the emoji+title repeated
    const stripped = trimmed.replace(/^[^\w가-힣]*/, '').trim();
    if (stripped === card.title || stripped === `${card.emoji} ${card.title}`) return false;
    if (trimmed === card.emoji || trimmed === card.title) return false;
    return true;
  });
  const description = lines.join('\n');

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Category gradient background with glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Emoji scale-up */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="text-6xl"
        >
          {card.emoji}
        </motion.div>

        {/* Title fade-in */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-2xl font-black text-white"
        >
          {card.title}
        </motion.h1>

        {/* Description fade-in (duplicate emoji/title filtered) */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center text-base text-white/80"
          >
            {renderWithLineBreaks(description)}
          </motion.p>
        )}
      </div>
    </div>
  );
}
