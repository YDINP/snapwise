'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import AnimatedCardContent from '@/components/feed/AnimatedCardContent';
import GlassCard from '@/components/ui/GlassCard';

interface RevealStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

const stepHeaders: Record<string, string> = {
  reveal: '💡 핵심 포인트',
  tip: '✅ 실전 팁',
  compare: '⚖️ 비교',
};

export default function RevealStep({ step, card, isActive }: RevealStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const header = stepHeaders[step.type] || '💡 핵심 포인트';

  return (
    <div className="relative w-full h-full flex items-center justify-center px-5">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        style={{ filter: 'blur(20px) brightness(0.3)' }}
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-2xl"
      >
        <GlassCard>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {header}
            </h3>
            <div className="text-white/90 text-base leading-relaxed">
              <AnimatedCardContent content={step.content} delayStart={0.25} staggerInterval={0.1} />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
