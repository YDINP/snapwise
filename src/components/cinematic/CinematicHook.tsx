'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';
import { fadeInUp, fadeIn, stagger } from '@/lib/motionVariants';

interface CinematicHookProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

export default function CinematicHook({ step, card, isActive }: CinematicHookProps) {
  const categoryInfo = getCategoryInfo(card.category);

  // 단어 단위 분할 (줄바꿈 기호 제거 후 공백 분리)
  const rawText = step.content.replace(/\\n/g, ' ').trim();
  const words = rawText.split(/\s+/).filter(Boolean);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Film grain texture */}
      {isActive && (
        <div
          className="pointer-events-none absolute inset-0 z-20 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6">
        {/* Emoji with halo glow */}
        <div className="relative">
          {/* Halo glow behind emoji */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="h-28 w-28 rounded-full blur-2xl"
              style={{ backgroundColor: `${categoryInfo.accent}25` }}
            />
          </motion.div>

          {/* Floating emoji */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isActive
              ? { opacity: 1, scale: 1, y: [0, -10, 0] }
              : { opacity: 0, scale: 0.5 }
            }
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 0.5, type: 'spring' },
              y: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
            className="relative text-8xl"
          >
            {card.emoji}
          </motion.div>
        </div>

        {/* Title: 단어별 stagger fadeInUp */}
        <motion.p
          variants={stagger}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="max-w-xs text-center text-xl font-bold text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)', wordBreak: 'keep-all' }}
          aria-label={rawText}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={fadeInUp}
              className="inline-block"
              style={{ marginRight: i < words.length - 1 ? '0.3em' : 0 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.p>

        {/* 보조 텍스트: 카테고리 배지 — 단어 stagger 완료 후 fadeIn */}
        <motion.span
          variants={fadeIn}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          transition={{ delay: 0.1 + words.length * 0.08 + 0.2 }}
          className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white/80"
          style={{ backgroundColor: `${categoryInfo.accent}30`, border: `1px solid ${categoryInfo.accent}50` }}
        >
          {categoryInfo.label}
        </motion.span>
      </div>

      {/* Pulsing CTA at bottom with arrow bounce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: [0.4, 0.8, 0.4] } : {}}
        transition={{
          delay: 0.8,
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-12 flex items-center gap-1 text-sm text-white/70"
      >
        탭하여 시작
        <motion.span
          animate={isActive ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          →
        </motion.span>
      </motion.div>
    </div>
  );
}
