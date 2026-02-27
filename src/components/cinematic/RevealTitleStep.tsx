'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface RevealTitleStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/** Generate deterministic sparkle configs from a seed string */
function generateSparkles(seed: string, count: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const next = () => {
    hash = (hash * 16807 + 11) % 2147483647;
    return (hash & 0x7fffffff) / 2147483647;
  };
  return Array.from({ length: count }, () => ({
    x: next() * 120 - 60,      // random offset -60..60
    y: next() * 120 - 60,
    size: 3 + next() * 4,       // 3..7px
    delay: 0.4 + next() * 0.6,  // stagger 0.4..1.0s
    duration: 0.6 + next() * 0.5,
  }));
}

/** Split emoji prefix from title text */
function splitEmoji(emoji: string, title: string) {
  // If the card emoji is present, separate it
  if (emoji) return { emoji, text: title };
  return { emoji: '', text: title };
}

export default function RevealTitleStep({ step, card, isActive }: RevealTitleStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const sparkles = useMemo(() => generateSparkles(card.slug ?? card.title, 7), [card.slug, card.title]);
  const { emoji, text: titleText } = splitEmoji(card.emoji, card.title);

  // Parse content: filter out lines that duplicate card emoji/title
  const lines = step.content.split('\n').filter((l: string) => {
    const trimmed = l.trim();
    if (!trimmed) return false;
    const stripped = trimmed.replace(/^[^\w가-힣]*/, '').trim();
    if (stripped === card.title || stripped === `${card.emoji} ${card.title}`) return false;
    if (trimmed === card.emoji || trimmed === card.title) return false;
    return true;
  });
  const description = lines.join('\n');

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* ── Circle clip-path reveal wrapper ── */}
      <motion.div
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={isActive ? { clipPath: 'circle(75% at 50% 50%)' } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-6 px-6"
      >
        {/* ── Title ── with accent decorative lines */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="h-px w-8 origin-right"
            style={{ backgroundColor: categoryInfo.accent }}
          />

          {/* Title container — blur-to-sharp focus-in */}
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.9 }}
              animate={isActive ? { opacity: 1, filter: 'blur(0px)', scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
              className="text-center text-2xl font-black text-white"
              style={{ wordBreak: 'keep-all' }}
            >
              {/* Emoji bounce-in (separate from text) */}
              {emoji && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.3, y: -10 }}
                  animate={isActive ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{
                    delay: 0.8,
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                  }}
                  className="mr-1 inline-block"
                >
                  {emoji}
                </motion.span>
              )}
              {titleText}
            </motion.h1>

            {/* ── Sparkle particles ── */}
            {sparkles.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={
                  isActive
                    ? {
                        opacity: [0, 1, 0],
                        x: s.x,
                        y: s.y,
                        scale: [0, 1.2, 0],
                      }
                    : {}
                }
                transition={{
                  delay: s.delay,
                  duration: s.duration,
                  ease: 'easeOut',
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: s.size,
                  height: s.size,
                  backgroundColor: categoryInfo.accent,
                  boxShadow: `0 0 ${s.size * 2}px ${categoryInfo.accent}`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="h-px w-8 origin-left"
            style={{ backgroundColor: categoryInfo.accent }}
          />
        </div>

        {/* Square image frame — between title and description */}
        {card.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.6, type: 'spring', damping: 18 }}
            className="relative flex flex-col items-center"
          >
            <div
              className="relative h-44 w-44 overflow-hidden rounded-2xl shadow-2xl"
              style={{ border: `3px solid ${categoryInfo.accent}60` }}
            >
              <img
                src={card.coverImage}
                alt={card.title}
                className="h-full w-full object-cover"
              />
              {/* ── Shine sweep across image ── */}
              <motion.div
                initial={{ left: '-100%' }}
                animate={isActive ? { left: '200%' } : {}}
                transition={{ delay: 1.0, duration: 0.8, ease: 'easeInOut' }}
                className="pointer-events-none absolute top-0 h-full w-1/2"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
                }}
              />
            </div>
            {/* Subtle glow behind frame */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl blur-2xl"
              style={{ backgroundColor: `${categoryInfo.accent}15` }}
            />
            {/* Image caption */}
            {card.coverImageCaption && (
              <p className="mt-2 w-44 text-center text-[10px] leading-tight text-white/40">
                {card.coverImageCaption}
              </p>
            )}
          </motion.div>
        )}

        {/* Description with accent-colored bold */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: card.coverImage ? 0.9 : 0.8, duration: 0.5 }}
            className="max-w-[22rem] text-center text-white/80"
            style={{
              fontSize: 'var(--card-text-body)',
              lineHeight: 'var(--card-line-height)',
              wordBreak: 'keep-all',
            }}
          >
            {renderWithLineBreaks(description, categoryInfo.accent)}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
