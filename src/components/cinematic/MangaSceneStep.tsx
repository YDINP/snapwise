'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta, Character } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface MangaSceneStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

type PanelEffect = 'basic' | 'focus' | 'speed' | 'impact';

interface PanelContentLine {
  type: 'narration' | 'dialogue' | 'sfx' | 'text';
  characterId?: string;
  text: string;
}

interface MangaPanel {
  effect: PanelEffect;
  lines: PanelContentLine[];
}

/** Parse the [panel] / [panel:focus] / etc. markers and their content */
function parsePanels(content: string): MangaPanel[] {
  const panels: MangaPanel[] = [];
  // Split by panel markers, keeping the marker itself
  const segments = content.split(/(\[panel(?::[\w]+)?\])/);

  let currentEffect: PanelEffect = 'basic';
  let currentLines: string[] = [];

  for (const segment of segments) {
    const markerMatch = segment.match(/^\[panel(?::([\w]+))?\]$/);
    if (markerMatch) {
      // Flush previous panel if it has content
      if (currentLines.length > 0) {
        panels.push({
          effect: currentEffect,
          lines: parsePanelContent(currentLines.join('\n')),
        });
        currentLines = [];
      }
      currentEffect = (markerMatch[1] as PanelEffect) || 'basic';
    } else {
      const trimmed = segment.trim();
      if (trimmed) {
        currentLines.push(trimmed);
      }
    }
  }

  // Flush last panel
  if (currentLines.length > 0) {
    panels.push({
      effect: currentEffect,
      lines: parsePanelContent(currentLines.join('\n')),
    });
  }

  // If no panels were parsed (no [panel] markers), treat whole content as one basic panel
  if (panels.length === 0 && content.trim()) {
    panels.push({
      effect: 'basic',
      lines: parsePanelContent(content),
    });
  }

  return panels;
}

/** Parse individual lines within a panel */
function parsePanelContent(content: string): PanelContentLine[] {
  const rawLines = content.split('\n').filter(l => l.trim());
  const result: PanelContentLine[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();

    // Narration caption: *(text)*
    if (/^\*\(.*\)\*$/.test(trimmed)) {
      result.push({ type: 'narration', text: trimmed.slice(2, -2) });
      continue;
    }

    // SFX / onomatopoeia: **text**
    if (/^\*\*.+\*\*$/.test(trimmed)) {
      result.push({ type: 'sfx', text: trimmed.slice(2, -2) });
      continue;
    }

    // Character dialogue: characterId: "text" or characterId: text
    const match = trimmed.match(/^([\w-]+):\s*[""]?(.+?)[""]?\s*$/);
    if (match) {
      result.push({ type: 'dialogue', characterId: match[1], text: match[2] });
      continue;
    }

    // Plain text / narration
    result.push({ type: 'text', text: trimmed });
  }

  return result;
}

/** Render inline bold (**text**) within regular text */
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

/** Generate SVG focus lines radiating from center */
function FocusLines({ opacity }: { opacity: number }) {
  const lineCount = 18;
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const angle = (i * 360) / lineCount;
    const rad = (angle * Math.PI) / 180;
    const cx = 50;
    const cy = 50;
    const innerR = 15;
    const outerR = 72;
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
    };
  });

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="black"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export default function MangaSceneStep({ step, card, isActive }: MangaSceneStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const panels = useMemo(() => parsePanels(step.content), [step.content]);

  // Collect unique speakers across all panels for side assignment
  const speakerOrder = useMemo(() => {
    const order: string[] = [];
    for (const panel of panels) {
      for (const line of panel.lines) {
        if (line.type === 'dialogue' && line.characterId && !order.includes(line.characterId)) {
          order.push(line.characterId);
        }
      }
    }
    return order;
  }, [panels]);

  const findChar = (id: string): Character =>
    card.characters?.find(c => c.id === id) ?? { id, name: id, emoji: '\uD83D\uDCAC' };

  // Limit to 2 panels for top-bottom layout
  const displayPanels = panels.slice(0, 2);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Panels with gutter gap */}
      <div className="relative z-10 flex h-full w-full flex-col gap-1.5 p-1.5">
        {displayPanels.map((panel, panelIndex) => {
          const isTop = panelIndex === 0;

          return (
            <motion.div
              key={panelIndex}
              className="relative flex-1 overflow-hidden"
              style={{
                backgroundColor: '#fff',
                border: '2px solid #000',
                borderRadius: '4px',
                ...(panel.effect === 'impact'
                  ? { clipPath: 'polygon(2% 0%, 98% 3%, 100% 97%, 3% 100%)' }
                  : {}),
              }}
              initial={{ opacity: 0, y: isTop ? -20 : 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: isTop ? 0.1 : 0.4,
                ease: 'easeOut',
              }}
            >
              {/* Screentone pattern */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #000 0.8px, transparent 0.8px)',
                  backgroundSize: '16px 16px',
                  opacity: 0.06,
                }}
              />

              {/* Panel effect overlays */}
              {panel.effect === 'focus' && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={isActive ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: isTop ? 0.3 : 0.6 }}
                >
                  <FocusLines opacity={0.12} />
                </motion.div>
              )}

              {panel.effect === 'speed' && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.08) 8px, rgba(0,0,0,0.08) 9px)',
                  }}
                />
              )}

              {/* Panel content */}
              <div className="relative z-10 flex h-full flex-col justify-center gap-2 px-3 py-3">
                {panel.lines.map((line, lineIndex) => {
                  const lineDelay = (isTop ? 0.2 : 0.5) + lineIndex * 0.12;

                  // Narration caption
                  if (line.type === 'narration') {
                    return (
                      <motion.div
                        key={lineIndex}
                        className="absolute left-2 top-2 z-20"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isActive ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: lineDelay }}
                      >
                        <span
                          className="inline-block rounded px-3 py-1.5 text-xs font-bold text-white"
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            wordBreak: 'keep-all',
                          }}
                        >
                          {line.text}
                        </span>
                      </motion.div>
                    );
                  }

                  // SFX / onomatopoeia
                  if (line.type === 'sfx') {
                    return (
                      <motion.div
                        key={lineIndex}
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, scale: 1.3, rotate: -12 }}
                        animate={
                          isActive
                            ? { opacity: 1, scale: 1, rotate: -8 }
                            : {}
                        }
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 15,
                          delay: lineDelay,
                        }}
                      >
                        <span
                          className="text-2xl font-black"
                          style={{
                            color: categoryInfo.accent,
                            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                            wordBreak: 'keep-all',
                          }}
                        >
                          {line.text}
                        </span>
                      </motion.div>
                    );
                  }

                  // Plain text
                  if (line.type === 'text') {
                    return (
                      <motion.p
                        key={lineIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={isActive ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: lineDelay }}
                        className="text-center text-xs font-medium text-gray-700"
                        style={{ wordBreak: 'keep-all' }}
                      >
                        {parseInlineBold(line.text, categoryInfo.accent)}
                      </motion.p>
                    );
                  }

                  // Dialogue
                  if (line.type === 'dialogue' && line.characterId) {
                    const character = findChar(line.characterId);
                    const sideIndex = speakerOrder.indexOf(line.characterId);
                    const isRight = sideIndex % 2 === 1;

                    return (
                      <motion.div
                        key={lineIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isActive ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 20,
                          delay: lineDelay,
                        }}
                        className={`flex items-end gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
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
                        <div
                          className={`relative max-w-[75%] ${isRight ? 'items-end' : 'items-start'}`}
                        >
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
                              backgroundColor: isRight
                                ? `${categoryInfo.accent}20`
                                : 'rgba(255,255,255,0.93)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              border: '1.5px solid rgba(0,0,0,0.1)',
                              borderBottomLeftRadius: isRight ? '16px' : '4px',
                              borderBottomRightRadius: isRight ? '4px' : '16px',
                            }}
                          >
                            <p
                              className={`text-sm leading-relaxed ${isRight ? 'text-gray-800' : 'text-gray-800'}`}
                              style={{ wordBreak: 'keep-all' }}
                            >
                              {line.text.split('\n').map((textLine, j, arr) => (
                                <React.Fragment key={j}>
                                  {parseInlineBold(
                                    textLine,
                                    categoryInfo.accent
                                  )}
                                  {j < arr.length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  return null;
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
