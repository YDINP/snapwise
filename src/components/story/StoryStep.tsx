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
    <div className="relative w-full h-full flex flex-col">
      {/* Top 40% - Image placeholder (category gradient) */}
      <div className={`h-[40%] bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Bottom 60% - Glass card with narrative */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-[60%] -mt-8"
      >
        <GlassCard className="h-full rounded-t-3xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="prose prose-invert max-w-none">
              <CardContent content={step.content} />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
