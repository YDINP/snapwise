'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface ImpactStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/** Parse inline **bold** for accent coloring */
function parseInlineAccent(text: string, accentColor: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={`b-${match.index}`} className="font-black" style={{ color: accentColor }}>
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function ImpactStep({ step, card, isActive }: ImpactStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const lines = step.content.split('\n').filter(l => l.trim());

  // Adaptive font size
  const fontSize = lines.length <= 3
    ? 'text-2xl md:text-3xl'
    : lines.length <= 5
      ? 'text-xl md:text-2xl'
      : 'text-lg md:text-xl';

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-black" />

      {/* Radial accent glow behind text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${categoryInfo.accent}20` }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-6 px-8">
        {/* Top accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="h-0.5 w-12 origin-center"
          style={{ backgroundColor: categoryInfo.accent }}
        />

        {/* Grouped blocks separated by dividers */}
        {(() => {
          // Split lines into blocks by divider
          const blocks: string[][] = [[]];
          lines.forEach(line => {
            if (/^[─━—-]{2,}$/.test(line.trim())) {
              blocks.push([]);
            } else {
              blocks[blocks.length - 1].push(line);
            }
          });
          const filteredBlocks = blocks.filter(b => b.length > 0);

          // Smaller font for secondary blocks
          const secondaryFontSize = lines.length <= 3
            ? 'text-xl md:text-2xl'
            : lines.length <= 5
              ? 'text-lg md:text-xl'
              : 'text-base md:text-lg';

          let globalIndex = 0;

          return (
            <div className="flex flex-col items-center gap-6">
              {filteredBlocks.map((block, blockIdx) => (
                <div key={blockIdx} className="flex flex-col items-center gap-1">
                  {/* Divider before secondary blocks */}
                  {blockIdx > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={isActive ? { opacity: 0.5, scaleX: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.2 + globalIndex * 0.08 }}
                      className="mb-2 h-0.5 w-16"
                      style={{ backgroundColor: categoryInfo.accent }}
                    />
                  )}
                  {block.map((line) => {
                    const idx = globalIndex++;
                    const trimmed = line.trim();
                    const isSecondary = blockIdx > 0;
                    return (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={isActive ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 + idx * 0.08, ease: 'easeOut' }}
                        className={`text-center ${isSecondary ? secondaryFontSize : fontSize} font-bold ${isSecondary ? 'text-white/70' : 'text-white/90'}`}
                        style={{ wordBreak: 'keep-all', lineHeight: 'var(--card-line-height-tight)' }}
                      >
                        {parseInlineAccent(trimmed, categoryInfo.accent)}
                      </motion.p>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 + lines.length * 0.08 }}
          className="h-0.5 w-12 origin-center"
          style={{ backgroundColor: categoryInfo.accent }}
        />
      </div>
    </div>
  );
}
