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
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content - centered */}
      <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
        {/* Emoji */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-7xl mb-6"
        >
          {card.emoji}
        </motion.div>

        {/* Card title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-2xl md:text-3xl font-black text-white leading-tight mb-5"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {card.title}
        </motion.h1>

        {/* Hook text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base md:text-lg text-white/90 leading-relaxed max-w-sm"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
        >
          <CardContent content={step.content} />
        </motion.div>

        {/* Category badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white/15 backdrop-blur-sm text-white/90"
        >
          <span>{categoryInfo.emoji}</span>
          <span>{categoryInfo.label}</span>
        </motion.div>
      </div>

      {/* Tap hint at bottom */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-0 right-0 text-center text-white/70 text-sm font-medium"
      >
        탭하여 시작 →
      </motion.div>
    </div>
  );
}
