'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import CardContent from '@/components/feed/CardContent';

interface HookStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function HookStep({ step, card, isActive }: HookStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${categoryInfo.gradient}`}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" style={{ filter: 'brightness(0.5)' }} />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative h-full flex flex-col justify-end pb-12 px-6"
      >
        {/* Emoji */}
        <div className="text-4xl mb-4">
          {card.emoji}
        </div>

        {/* Hook text */}
        <div className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          <CardContent content={step.content} />
        </div>

        {/* Category badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${categoryInfo.bgLight} dark:${categoryInfo.bgDark} w-fit`}>
          <span>{categoryInfo.emoji}</span>
          <span>{categoryInfo.label}</span>
        </div>

        {/* Tap to start */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/80 text-sm font-medium"
        >
          탭하여 시작 →
        </motion.div>
      </motion.div>
    </div>
  );
}
