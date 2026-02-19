'use client';

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

export default function ShowcaseStep({ step, card, isActive }: ShowcaseStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { intro, items } = parseShowcase(step.content);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 px-6">
        {/* Intro text */}
        {intro && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center text-sm font-medium text-white/70"
          >
            {renderWithLineBreaks(intro)}
          </motion.p>
        )}

        {/* Showcase cards */}
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={isActive ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"
            style={{
              boxShadow: `0 0 30px ${categoryInfo.accent}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            <div className="flex items-start gap-4">
              {/* Emoji avatar */}
              {item.emoji && (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${categoryInfo.accent}25` }}
                >
                  {item.emoji}
                </div>
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
        ))}
      </div>
    </div>
  );
}
