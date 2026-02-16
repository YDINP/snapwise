'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import CardContent from '@/components/feed/CardContent';
import GlassCard from '@/components/ui/GlassCard';

interface StoryStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function StoryStep({ step, card, isActive }: StoryStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative w-full h-full">
      {/* Full-screen gradient background (darkened) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        style={{ filter: 'brightness(0.35)' }}
      />

      {/* Content - centered glass card */}
      <div className="relative h-full flex items-center px-5 pt-14 pb-8">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <GlassCard className="max-h-[72vh] overflow-y-auto">
            <div className="card-content text-white/90 text-base leading-relaxed">
              <CardContent content={step.content} />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
