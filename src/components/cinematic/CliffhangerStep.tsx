'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { parseInline } from '@/lib/renderContent';

interface CliffhangerStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/**
 * CliffhangerStep — 전환점 비트
 * 다음 스텝에 대한 궁금증 유발. "그런데...", "그 결과는?" 형식.
 * 텍스트가 아래서 올라오며 등장. 하단에 다음 장 힌트.
 */
export default function CliffhangerStep({ step, card, isActive }: CliffhangerStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const lines = step.content.split('\n').filter(l => l.trim());

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* 짙은 배경 */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* 하단→중앙 카테고리 색상 그라데이션 오버레이 */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background: `linear-gradient(to top, ${categoryInfo.accent}18 0%, transparent 100%)`,
        }}
      />

      {/* 수평 구분선 (중앙 살짝 위) */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="absolute top-[40%] left-8 right-8 h-px origin-left"
        style={{
          background: `linear-gradient(90deg, ${categoryInfo.accent}60, transparent)`,
        }}
      />

      {/* 메인 텍스트 블록 */}
      <div className="relative z-10 flex flex-col items-start gap-4 px-8 w-full max-w-sm">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.1 + i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-xl font-bold leading-snug text-white/90"
            style={{ wordBreak: 'keep-all', textWrap: 'balance' as React.CSSProperties['textWrap'] }}
          >
            {parseInline(line, categoryInfo.accent)}
          </motion.p>
        ))}

        {/* 말줄임표 애니메이션 */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: [0, 1, 0.4, 1, 0.4, 1] } : {}}
          transition={{
            duration: 2,
            delay: 0.3 + lines.length * 0.12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-2xl font-black tracking-widest"
          style={{ color: categoryInfo.accent }}
        >
          ...
        </motion.span>
      </div>

      {/* 하단 "다음 장" 힌트 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 + lines.length * 0.12 }}
        className="absolute bottom-14 flex items-center gap-3"
      >
        <motion.span
          animate={isActive ? { x: [-4, 0, -4] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base"
          style={{ color: `${categoryInfo.accent}80` }}
        >
          ←
        </motion.span>
        <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">
          다음 장에서 밝혀집니다
        </span>
        <motion.span
          animate={isActive ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base"
          style={{ color: `${categoryInfo.accent}80` }}
        >
          →
        </motion.span>
      </motion.div>
    </div>
  );
}
