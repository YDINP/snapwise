'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface ShowcaseStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface ShowcaseItem {
  emoji: string;
  title: string;
  description: string;
}

function parseShowcase(content: string): { intro: string; items: ShowcaseItem[] } {
  const sections = content.split('───').map(s => s.trim()).filter(Boolean);
  const intro = sections[0] || '';
  const items: ShowcaseItem[] = [];

  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*(.+)$/u;
    let currentItem: ShowcaseItem | null = null;

    for (const line of lines) {
      const emojiMatch = line.match(emojiRegex);
      if (emojiMatch) {
        // 이전 아이템이 있으면 push
        if (currentItem) items.push(currentItem);
        currentItem = {
          emoji: emojiMatch[1],
          title: emojiMatch[2],
          description: '',
        };
      } else if (currentItem) {
        currentItem.description += (currentItem.description ? '\n' : '') + line;
      } else {
        // 이모지 없는 첫 라인 → 타이틀만 있는 아이템
        currentItem = { emoji: '', title: line, description: '' };
      }
    }
    if (currentItem) items.push(currentItem);
  }

  return { intro, items };
}

/** Typewriter component: animates text word by word */
function TypewriterText({ text, isActive, className }: { text: string; isActive: boolean; className?: string }) {
  const words = text.split(/(\s+)/);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= words.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [isActive, words.length]);

  return (
    <span className={className}>
      {words.map((word, idx) => (
        <span
          key={idx}
          style={{
            opacity: idx < visibleCount ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export default function ShowcaseStep({ step, card, isActive }: ShowcaseStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { intro, items } = parseShowcase(step.content);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-black/60" />

      {/* Emoji glow pulse keyframes */}
      <style>{`
        @keyframes emojiGlowPulse {
          0%, 100% { box-shadow: 0 0 8px var(--emoji-glow-color, rgba(255,255,255,0.15)); }
          50% { box-shadow: 0 0 20px var(--emoji-glow-color, rgba(255,255,255,0.35)); }
        }
      `}</style>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 px-6">
        {/* Intro text — typewriter animation */}
        {intro && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="text-center text-sm font-medium text-white/70"
          >
            <TypewriterText text={intro} isActive={isActive} />
          </motion.p>
        )}

        {/* Showcase cards — alternating slide + 3D tilt + glass shine */}
        {items.map((item, i) => {
          const isOdd = i % 2 === 0; // 0-indexed: first card from left, second from right, etc.
          const slideX = isOdd ? -30 : 30;

          return (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: slideX,
                transform: `perspective(800px) rotateX(10deg)`,
              }}
              animate={isActive ? {
                opacity: 1,
                x: 0,
                transform: `perspective(800px) rotateX(0deg)`,
              } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.18, ease: 'easeOut' }}
              className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"
              style={{
                boxShadow: `0 0 30px ${categoryInfo.accent}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >

              <div className="flex items-start gap-4">
                {/* Emoji avatar with glow pulse */}
                {item.emoji && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isActive ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.18 }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
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
                  <h3 className="mb-1 text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70" style={{ wordBreak: 'keep-all', textWrap: 'balance' }}>
                    {renderWithLineBreaks(item.description)}
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
