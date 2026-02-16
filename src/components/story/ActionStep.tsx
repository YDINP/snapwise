'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import AnimatedCardContent from '@/components/feed/AnimatedCardContent';
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
    <div className="relative w-full h-full">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        style={{ filter: 'blur(10px) brightness(0.35)' }}
      />

      <div className="relative h-full flex flex-col justify-center px-5 py-12 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard>
            <div className="text-center space-y-3">
              <div className="text-5xl mb-3">{card.emoji}</div>
              <div className="text-white/90 text-base leading-relaxed">
                <AnimatedCardContent content={step.content} delayStart={0.15} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex gap-3"
        >
          <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-5 py-3 rounded-xl font-medium text-white text-sm">
            공유하기
          </button>
          <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-5 py-3 rounded-xl font-medium text-white text-sm">
            북마크
          </button>
        </motion.div>

        {nextCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="cursor-pointer hover:bg-white/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{nextCard.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/50 mb-1">다음 이야기</div>
                  <div className="text-sm font-medium text-white truncate">{nextCard.title}</div>
                </div>
                <div className="text-white/50">↓</div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
