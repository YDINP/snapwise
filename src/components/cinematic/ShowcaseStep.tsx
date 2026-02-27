'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';
import TypingText from './TypingText';

interface ShowcaseStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface ShowcaseItem {
  emoji: string;
  title: string;
  subtitle: string; // [A1] 파이프(|) 파싱으로 분리된 우측 값
  description: string;
}

// [A1] 파이프(|) 파싱 추가: "별 하나|좋은 식당" → title="별 하나", subtitle="좋은 식당"
function parseShowcase(content: string): { intro: string; items: ShowcaseItem[] } {
  const sections = content.split('───').map(s => s.trim()).filter(Boolean);
  const intro = sections[0] || '';
  const items: ShowcaseItem[] = [];

  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // [Fix] 복수 이모지(⭐⭐⭐) + variation selector(FE0F, ZWJ 시퀀스) 전체 캡처
    const emojiRegex = /^((?:(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})[\uFE0F\u20D0-\u20FF]?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})[\uFE0F\u20D0-\u20FF]?)*)+)\s+(.+)$/u;
    let currentItem: ShowcaseItem | null = null;

    for (const line of lines) {
      const emojiMatch = line.match(emojiRegex);
      if (emojiMatch) {
        if (currentItem) items.push(currentItem);
        const rawTitle = emojiMatch[2];
        const pipeIdx = rawTitle.indexOf('|');
        const title = pipeIdx !== -1 ? rawTitle.slice(0, pipeIdx).trim() : rawTitle;
        const subtitle = pipeIdx !== -1 ? rawTitle.slice(pipeIdx + 1).trim() : '';
        currentItem = { emoji: emojiMatch[1], title, subtitle, description: '' };
      } else if (currentItem) {
        currentItem.description += (currentItem.description ? '\n' : '') + line;
      } else {
        // 이모지 없는 첫 라인 → 파이프 파싱 후 타이틀만
        const pipeIdx = line.indexOf('|');
        const title = pipeIdx !== -1 ? line.slice(0, pipeIdx).trim() : line;
        const subtitle = pipeIdx !== -1 ? line.slice(pipeIdx + 1).trim() : '';
        currentItem = { emoji: '', title, subtitle, description: '' };
      }
    }
    if (currentItem) items.push(currentItem);
  }

  return { intro, items };
}

export default function ShowcaseStep({ step, card, isActive }: ShowcaseStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { intro, items } = parseShowcase(step.content);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-black/60" />

      {/* [B1] shimmer keyframes */}
      <style>{`
        @keyframes emojiGlowPulse {
          0%, 100% { box-shadow: 0 0 8px var(--emoji-glow-color, rgba(255,255,255,0.15)); }
          50% { box-shadow: 0 0 20px var(--emoji-glow-color, rgba(255,255,255,0.35)); }
        }
      `}</style>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 px-6">
        {/* [A2] Intro text — 전역 TypingText (bold + 커서 지원) */}
        {intro && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="text-center text-sm font-medium text-white/70"
          >
            <TypingText text={intro} isActive={isActive} startDelay={200} speed={40} />
          </motion.p>
        )}

        {/* Showcase cards */}
        {items.map((item, i) => {
          const isOdd = i % 2 === 0;
          const slideX = isOdd ? -30 : 30;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: slideX, transform: 'perspective(800px) rotateX(10deg)' }}
              animate={isActive ? { opacity: 1, x: 0, transform: 'perspective(800px) rotateX(0deg)' } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.18, ease: 'easeOut' }}
              className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"
              style={{
                boxShadow: `0 0 30px ${categoryInfo.accent}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {/* [B1] Glass shimmer sweep — OutroStep 패턴 */}
              <motion.div
                initial={{ left: '-60%' }}
                animate={isActive ? { left: '160%' } : {}}
                transition={{
                  delay: 0.8 + i * 0.18,
                  duration: 1.6,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'easeInOut',
                }}
                className="pointer-events-none absolute top-0 h-full w-1/3"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)',
                }}
              />

              <div className="flex items-start gap-4">
                {/* [B3] Emoji — spring 애니메이션 */}
                {item.emoji && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={isActive ? { scale: 1, opacity: 1 } : {}}
                    transition={{
                      delay: 0.5 + i * 0.18,
                      type: 'spring',
                      stiffness: 400,
                      damping: 12,
                    }}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${[...item.emoji].length >= 3 ? 'text-sm' : [...item.emoji].length >= 2 ? 'text-base' : 'text-2xl'}`}
                    style={{
                      backgroundColor: `${categoryInfo.accent}25`,
                      animation: isActive ? 'emojiGlowPulse 2.5s ease-in-out infinite' : 'none',
                      ['--emoji-glow-color' as string]: `${categoryInfo.accent}40`,
                    }}
                  >
                    {item.emoji}
                  </motion.div>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* [A1] subtitle 있으면 title + accent badge로 표시 */}
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    {item.subtitle && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${categoryInfo.accent}25`,
                          color: categoryInfo.accent,
                        }}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  {/* [B4] description — accent 색상 bold 지원 */}
                  <p
                    className="text-sm leading-relaxed text-white/70"
                    style={{ wordBreak: 'keep-all', textWrap: 'balance' } as React.CSSProperties}
                  >
                    {renderWithLineBreaks(item.description, categoryInfo.accent)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
