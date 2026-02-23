'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface SceneStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/**
 * step.content의 첫 줄이 길이 30자 미만이고 줄바꿈이 존재하는 경우
 * caption(첫 줄)과 body(나머지)로 분리한다.
 */
function splitCaption(content: string): { caption: string | null; body: string } {
  const newlineIndex = content.indexOf('\n');
  if (newlineIndex === -1) {
    return { caption: null, body: content };
  }
  const firstLine = content.slice(0, newlineIndex).trim();
  const rest = content.slice(newlineIndex + 1).trim();
  if (firstLine.length < 30) {
    return { caption: firstLine, body: rest };
  }
  return { caption: null, body: content };
}

export default function SceneStep({ step, card, isActive }: SceneStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { caption, body } = splitCaption(step.content);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Base overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Cinematic letterbox — top bar */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute top-0 left-0 right-0 h-12 bg-black z-20"
        />
      )}

      {/* Cinematic letterbox — bottom bar */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute bottom-0 left-0 right-0 h-12 bg-black z-20"
        />
      )}

      {/* Centered text content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full px-8"
      >
        {caption !== null && (
          <p
            className="text-center text-xs tracking-widest text-white/50 mb-3 uppercase"
            style={{ wordBreak: 'keep-all' }}
          >
            {caption}
          </p>
        )}
        <p
          className="text-center text-xl font-semibold text-white"
          style={{
            wordBreak: 'keep-all',
            textWrap: 'balance',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {renderWithLineBreaks(body)}
        </p>
      </motion.div>
    </div>
  );
}
