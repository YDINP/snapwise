'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import CardContent from '@/components/feed/CardContent';
import GlassCard from '@/components/ui/GlassCard';

interface RevealStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function RevealStep({ step, card, isActive }: RevealStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div className="relative w-full h-full flex items-center justify-center px-6">
      {/* Blurred background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        style={{ filter: 'blur(20px) brightness(0.3)' }}
      />

      {/* Centered glass card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-2xl"
      >
        <GlassCard>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">
              💡 핵심 포인트
            </h3>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="prose prose-invert max-w-none"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <CardContent content={step.content} />
              </motion.div>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
