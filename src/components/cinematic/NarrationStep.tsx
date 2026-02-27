'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface NarrationStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

// 나레이션 스텝 전용 이모지 prefix 상수
const NARRATION_EMOJI = '📖';

/**
 * step.content에서 📖 prefix를 분리합니다.
 * Intl.Segmenter 없이 단순 startsWith로 처리 (이모지가 정확히 📖 한 개이므로 안전).
 */
function splitEmojiPrefix(content: string): { hasPrefix: boolean; bodyText: string } {
  const trimmed = content.trimStart();
  if (trimmed.startsWith(NARRATION_EMOJI)) {
    return {
      hasPrefix: true,
      bodyText: trimmed.slice(NARRATION_EMOJI.length).trimStart(),
    };
  }
  return { hasPrefix: false, bodyText: content };
}

export default function NarrationStep({ step, card, isActive }: NarrationStepProps) {
  const categoryInfo = getCategoryInfo(card.category);

  // 이모지 prefix 분리
  const { hasPrefix, bodyText } = splitEmojiPrefix(step.content);

  // 본문 라인 수 기반 적응형 폰트 크기
  const lines = bodyText.split('\n').filter(l => l.trim());
  const fontSize =
    lines.length <= 4
      ? 'text-lg md:text-xl'
      : lines.length <= 7
        ? 'text-base md:text-lg'
        : 'text-sm md:text-base';

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* 카테고리 그라디언트 배경 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* 메인 컨텐츠 래퍼 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mx-6 flex max-w-sm flex-col items-center"
      >
        {/* 이모지 헤더 — 📖 prefix가 있을 때만 렌더링 */}
        {hasPrefix && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
            className="mb-3 shrink-0 text-2xl leading-none"
            aria-hidden="true"
          >
            {NARRATION_EMOJI}
          </motion.div>
        )}

        {/* Accent dot — 상단 중앙 (이모지 없을 때) */}
        {!hasPrefix && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mb-4 h-1 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: categoryInfo.accent }}
          />
        )}

        {/* 글래스 카드 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl bg-white/10 p-7 backdrop-blur-md"
        >
          {/* 본문 텍스트 */}
          <p
            className={`text-center ${fontSize} font-medium text-white/90`}
            style={{
              wordBreak: 'keep-all',
              lineHeight: 'var(--card-line-height)',
              textShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            {renderWithLineBreaks(bodyText, categoryInfo.accent)}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
