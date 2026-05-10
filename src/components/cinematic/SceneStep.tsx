'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { parseInline } from '@/lib/renderContent';
import { lineStagger, lineFadeUp } from '@/lib/motionVariants';

interface SceneStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
  stepIndex?: number;
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

export default function SceneStep({ step, card, isActive, stepIndex }: SceneStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { caption, body } = splitCaption(step.content);
  const sceneVisual = stepIndex !== undefined
    ? card.visuals?.scenes?.find(s => s.stepIndex === stepIndex)?.src
    : undefined;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Category gradient background — subtle breathing scale */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`}
        animate={isActive ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center center' }}
      />

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
          className="absolute top-0 left-0 right-0 h-10 z-20"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.80) 0%, transparent 100%)' }}
        />
      )}

      {/* Cinematic letterbox — bottom bar */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute bottom-0 left-0 right-0 h-10 z-20"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)' }}
        />
      )}

      {/* Centered content: visual + text */}
      <div className="relative z-10 flex w-full flex-col items-center gap-6 px-8">
        {/* AI illustration */}
        {sceneVisual && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={isActive ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <div
              className="absolute -inset-3 rounded-3xl blur-2xl"
              style={{ backgroundColor: 'rgba(217,119,6,0.20)' }}
            />
            <div
              className="relative h-52 w-52 overflow-hidden rounded-2xl shadow-xl"
              style={{ border: '2px solid rgba(217,119,6,0.35)' }}
            >
              <img src={sceneVisual} alt="" className="h-full w-full object-cover" />
            </div>
          </motion.div>
        )}

        {caption !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-ko text-center text-xs tracking-widest text-white/50 uppercase"
          >
            {caption}
          </motion.p>
        )}
        <motion.div
          variants={lineStagger}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          className="flex flex-col items-center gap-1"
        >
          {body.split('\n').filter(l => l.trim()).map((line, i) => (
            <motion.p
              key={i}
              variants={lineFadeUp}
              className="text-ko text-center text-lg font-semibold text-white"
              style={{
                textWrap: 'balance' as React.CSSProperties['textWrap'],
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}
            >
              {parseInline(line.trim())}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
