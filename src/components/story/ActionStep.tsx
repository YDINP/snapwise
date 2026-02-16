'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import CardContent from '@/components/feed/CardContent';
import GlassCard from '@/components/ui/GlassCard';

interface ActionStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
}

export default function ActionStep({ step, card, isActive, nextCard }: ActionStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative w-full h-full overflow-y-auto">
      {/* Blurred background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        style={{ filter: 'blur(10px) brightness(0.4)' }}
      />

      {/* Content */}
      <div className="relative min-h-full flex flex-col justify-center px-6 py-12 space-y-6">
        {/* Summary section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard>
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">{card.emoji}</div>
              <div className="prose prose-invert max-w-none">
                <CardContent content={step.content} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-3"
        >
          <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-medium text-white">
            공유하기
          </button>
          <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-medium text-white">
            북마크
          </button>
        </motion.div>

        {/* Next card preview */}
        {nextCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="cursor-pointer hover:bg-white/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{nextCard.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm text-white/60 mb-1">다음 이야기</div>
                  <div className="font-medium text-white">{nextCard.title}</div>
                </div>
                <div className="text-white/60">→</div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
