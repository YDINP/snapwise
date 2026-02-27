'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface FactStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/**
 * FactStep — 빠른 리듬 비트 (Quick Beat)
 * 단일 팩트를 짧고 강렬하게 전달. 즉각적인 탭 욕구 유발.
 */
export default function FactStep({ step, card, isActive }: FactStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const lines = step.content.split('\n').filter(l => l.trim());
  const headline = lines[0] ?? '';
  const subtext = lines.slice(1).join('\n');

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* 짙은 단색 배경 */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* 좌측 수직 컬러 라인 */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={isActive ? { scaleY: 1, opacity: 1 } : {}}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-[3px] h-32 origin-top rounded-full"
        style={{ backgroundColor: categoryInfo.accent }}
      />

      {/* 우측 배경 글로우 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-64 w-48 rounded-full blur-[80px]"
        style={{ backgroundColor: `${categoryInfo.accent}08` }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col gap-5 px-14 w-full max-w-sm">
        {/* FACT 레이블 */}
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="text-[10px] font-black uppercase tracking-[0.35em]"
          style={{ color: `${categoryInfo.accent}90` }}
        >
          FACT
        </motion.span>

        {/* 헤드라인 */}
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl font-black leading-tight text-white"
          style={{ wordBreak: 'keep-all', textWrap: 'balance' as React.CSSProperties['textWrap'] }}
        >
          {headline}
        </motion.p>

        {/* 부가 설명 */}
        {subtext && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="text-sm font-medium leading-relaxed text-white/50"
            style={{ wordBreak: 'keep-all' }}
          >
            {subtext}
          </motion.p>
        )}

        {/* 하단 accent 도트 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isActive ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.3, type: 'spring', stiffness: 300 }}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: categoryInfo.accent }}
        />
      </div>
    </div>
  );
}
