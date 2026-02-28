'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import AnimatedCardContent from '@/components/feed/AnimatedCardContent';
import GlassCard from '@/components/ui/GlassCard';

interface StoryStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

const stepLabels: Record<string, string> = {
  story: '',
  detail: '자세히',
  example: '예시',
};

export default function StoryStep({ step, card, isActive }: StoryStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const label = stepLabels[step.type] || '';

  return (
    <div className="relative w-full h-full">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        style={{ filter: 'brightness(0.35)' }}
      />

      <div className="relative h-full flex items-center px-5 pt-14 pb-8">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <GlassCard className="max-h-[72vh] overflow-y-auto">
            {label && (
              <div className="text-sm font-semibold text-white/60 mb-3">{label}</div>
            )}
            <div className="text-white/90 text-base leading-relaxed">
              <AnimatedCardContent content={step.content} delayStart={0.2} />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
