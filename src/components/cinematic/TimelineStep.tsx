'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface TimelineStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface TimelineItem {
  label: string;
  event: string;
  emoji: string;
}

/** 이모지를 텍스트 앞에서 추출. 첫 번째 Emoji_Presentation 문자 및 trailing 공백 분리. */
function extractLeadingEmoji(text: string): { emoji: string; rest: string } {
  const match = text.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
  if (match) {
    return { emoji: match[1], rest: text.slice(match[0].length) };
  }
  return { emoji: '', rest: text };
}

/**
 * content 파싱:
 *   - `|` 포함 줄: "label | event" 형태의 타임라인 항목
 *   - 나머지 줄: 인트로 텍스트 (비어있지 않은 첫 번째 블록)
 */
function parseTimeline(content: string): { intro: string; items: TimelineItem[] } {
  const lines = content.split('\n');
  const introLines: string[] = [];
  const items: TimelineItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes('|')) {
      const pipeIdx = trimmed.indexOf('|');
      const label = trimmed.slice(0, pipeIdx).trim();
      const rawEvent = trimmed.slice(pipeIdx + 1).trim();
      const { emoji, rest } = extractLeadingEmoji(rawEvent);
      items.push({ label, event: rest, emoji });
    } else {
      // 타임라인 항목이 아직 없으면 인트로로 취급
      if (items.length === 0) {
        introLines.push(trimmed);
      }
    }
  }

  return { intro: introLines.join('\n'), items };
}

export default function TimelineStep({ step, card, isActive }: TimelineStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { intro, items } = parseTimeline(step.content);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${categoryInfo.accent}12 0%, transparent 70%)`,
        }}
      />

      {/* Content area */}
      <div className="relative z-10 flex h-full w-full flex-col px-4 py-6">
        {/* Intro text */}
        {intro && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mb-5 text-center text-xs font-medium text-white/50"
            style={{ wordBreak: 'keep-all' }}
          >
            {intro}
          </motion.p>
        )}

        {/* Timeline */}
        <div className="relative flex flex-1 flex-col justify-center">
          {/* Center vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isActive ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="absolute left-1/2 top-0 bottom-0 w-px origin-top -translate-x-1/2"
            style={{ backgroundColor: `${categoryInfo.accent}4D` }} /* opacity ~30% */
          />

          {/* Items */}
          <div className="flex flex-col gap-5">
            {items.map((item, i) => {
              // Odd index (1, 3, 5...): year LEFT, event RIGHT
              // Even index (0, 2, 4...): year LEFT, event RIGHT  — 심플하게 year 좌측, event 우측 고정
              // (요청: "just put year on left, event on right, with a dot on the timeline")
              const delay = 0.2 + i * 0.12;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={isActive ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, ease: 'easeOut', delay }}
                  className="relative flex items-center"
                >
                  {/* Left: Year/label */}
                  <div className="flex w-[42%] justify-end pr-4">
                    <span
                      className="text-right text-sm font-bold leading-tight"
                      style={{ color: categoryInfo.accent, wordBreak: 'keep-all' }}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Center: dot on the timeline */}
                  <div className="relative flex w-[16%] items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isActive ? { scale: 1 } : {}}
                      transition={{ duration: 0.3, ease: 'backOut', delay: delay + 0.05 }}
                      className="h-3 w-3 rounded-full ring-2 ring-black"
                      style={{ backgroundColor: categoryInfo.accent }}
                    />
                  </div>

                  {/* Right: Event text (with optional emoji icon) */}
                  <div className="flex w-[42%] items-center gap-1.5 pl-4">
                    {item.emoji && (
                      <span className="shrink-0 text-sm leading-none" aria-hidden>
                        {item.emoji}
                      </span>
                    )}
                    <span
                      className="text-sm leading-snug text-white/80"
                      style={{ wordBreak: 'keep-all' }}
                    >
                      {item.event}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
