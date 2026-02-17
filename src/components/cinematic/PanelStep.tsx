'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta, Character } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface PanelStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface PanelLine {
  characterId: string | null;
  text: string;
  isStageDirection: boolean;
}

/** Parse panel content: "characterId: text" per line, merging continuation lines */
function parsePanelLines(content: string): PanelLine[] {
  const rawLines = content.split('\n').filter(l => l.trim());
  const result: PanelLine[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();

    // Stage direction line: *(text)*
    if (/^\*\(.*\)\*$/.test(trimmed)) {
      result.push({ characterId: null, text: trimmed.slice(2, -2), isStageDirection: true });
      continue;
    }

    // Character line: characterId: "text" or characterId: text
    const match = trimmed.match(/^([\w-]+):\s*(.+)/);
    if (match) {
      const text = match[2].replace(/^[""]|[""]$/g, '');
      result.push({ characterId: match[1], text, isStageDirection: false });
      continue;
    }

    // Continuation line — merge into previous character's dialogue
    if (result.length > 0 && result[result.length - 1].characterId) {
      result[result.length - 1].text += '\n' + trimmed;
      continue;
    }

    // Plain narration (no previous character to attach to)
    result.push({ characterId: null, text: trimmed, isStageDirection: false });
  }

  return result;
}

/** Parse **bold** inline */
function parseInlineBold(text: string, accentColor: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <strong key={`b-${match.index}`} className="font-bold" style={{ color: accentColor }}>
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

export default function PanelStep({ step, card, isActive }: PanelStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const lines = parsePanelLines(step.content);

  // Track which characters appear and assign side (first speaker = left, second = right, alternate)
  const speakerOrder: string[] = [];
  lines.forEach(l => {
    if (l.characterId && !speakerOrder.includes(l.characterId)) {
      speakerOrder.push(l.characterId);
    }
  });

  const findChar = (id: string): Character =>
    card.characters?.find(c => c.id === id) ?? { id, name: id, emoji: '💬' };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Subtle manga tone pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-center gap-3 px-4 py-5">
        {lines.map((line, i) => {
          const delay = 0.15 + i * 0.12;

          // Stage direction — centered italic
          if (line.isStageDirection) {
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 0.6 } : {}}
                transition={{ duration: 0.4, delay }}
                className="text-center text-xs italic text-white/50"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {line.text}
              </motion.p>
            );
          }

          // Narration line — centered
          if (!line.characterId) {
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay }}
                className="text-center text-xs font-medium text-white/60"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {parseInlineBold(line.text, categoryInfo.accent)}
              </motion.p>
            );
          }

          // Character dialogue
          const character = findChar(line.characterId);
          const sideIndex = speakerOrder.indexOf(line.characterId);
          const isRight = sideIndex % 2 === 1;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isRight ? 20 : -20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, ease: 'easeOut', delay }}
              className={`flex items-end gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Mini avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                style={{
                  background: `linear-gradient(135deg, ${categoryInfo.accent}30, ${categoryInfo.accent}10)`,
                  border: `2px solid ${categoryInfo.accent}60`,
                }}
              >
                {character.emoji}
              </div>

              {/* Bubble */}
              <div className={`relative max-w-[75%] ${isRight ? 'items-end' : 'items-start'}`}>
                {/* Name tag */}
                <span
                  className={`mb-0.5 block text-[10px] font-bold ${isRight ? 'text-right' : 'text-left'}`}
                  style={{ color: `${categoryInfo.accent}CC` }}
                >
                  {character.name}
                </span>

                {/* Speech bubble */}
                <div
                  className="relative rounded-2xl px-3.5 py-2.5"
                  style={{
                    backgroundColor: isRight ? `${categoryInfo.accent}20` : 'rgba(255,255,255,0.93)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    borderBottomLeftRadius: isRight ? '16px' : '4px',
                    borderBottomRightRadius: isRight ? '4px' : '16px',
                  }}
                >
                  <p
                    className={`text-sm leading-relaxed ${isRight ? 'text-white/90' : 'text-gray-800'}`}
                    style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
                  >
                    {line.text.split('\n').map((textLine, j, arr) => (
                      <React.Fragment key={j}>
                        {parseInlineBold(textLine, isRight ? '#fff' : categoryInfo.accent)}
                        {j < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
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
