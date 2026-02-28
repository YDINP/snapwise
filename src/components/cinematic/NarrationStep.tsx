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

      {/* 배경 미세 패턴 — 중앙 부분에 radial 글로우 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${categoryInfo.accent}33, transparent)`,
        }}
      />

      {/* 메인 컨텐츠 래퍼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 mx-6 w-full max-w-sm"
      >
        {/* 이모지 헤더 — 📖 prefix가 있을 때만 렌더링 */}
        {hasPrefix && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="mb-4 flex justify-center"
            aria-hidden="true"
          >
            <span className="text-3xl leading-none drop-shadow-md">{NARRATION_EMOJI}</span>
          </motion.div>
        )}

        {/* 인용구 스타일 레이아웃: 세로 accent 바 + 텍스트 */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: hasPrefix ? 0.2 : 0.15, ease: 'easeOut' }}
          className="flex items-stretch gap-4"
        >
          {/* Accent 세로 바 */}
          <div
            className="w-1 shrink-0 rounded-full opacity-90"
            style={{ backgroundColor: categoryInfo.accent }}
          />

          {/* 글래스 카드 + 본문 */}
          <div className="flex-1 rounded-2xl bg-white/10 px-5 py-6 backdrop-blur-md">
            {/* 본문 텍스트 */}
            <p
              className={`${fontSize} font-medium text-white/90`}
              style={{
                wordBreak: 'keep-all',
                lineHeight: 'var(--card-line-height)',
                textShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
            >
              {renderWithLineBreaks(bodyText, categoryInfo.accent)}
            </p>

            {/* 하단 구분선 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isActive ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: hasPrefix ? 0.4 : 0.35, ease: 'easeOut' }}
              className="mt-5 h-px origin-left rounded-full bg-white/20"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
