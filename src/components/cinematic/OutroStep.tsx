'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';
import { Share2, Bookmark } from 'lucide-react';

interface OutroStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
}

export default function OutroStep({ step, card, isActive, nextCard }: OutroStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const nextCategoryInfo = nextCard ? getCategoryInfo(nextCard.category) : null;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden py-12">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-8 px-6">
        {/* Summary glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm rounded-2xl bg-white/15 p-6 backdrop-blur-md"
        >
          <p className="text-center text-sm leading-relaxed text-white/90">
            {renderWithLineBreaks(step.content)}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex gap-4"
        >
          <button className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
            <Share2 size={16} />
            공유하기
          </button>
          <button className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
            <Bookmark size={16} />
            저장하기
          </button>
        </motion.div>
      </div>

      {/* Next card preview */}
      {nextCard && nextCategoryInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-10 w-full max-w-sm px-6"
        >
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-2 text-xs text-white/60">다음 카드</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nextCard.emoji}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{nextCard.title}</h3>
                <p className="text-xs text-white/70">{nextCategoryInfo.label}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
