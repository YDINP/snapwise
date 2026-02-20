'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import type { CardStep, CardMeta, Character } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MangaSceneStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

type MangaPanelType =
  | 'narrative'
  | 'dialogue'
  | 'action'
  | 'data'
  | 'versus'
  | 'revelation'
  | 'montage'
  | 'closeup';

interface ContentLine {
  type: 'narration' | 'dialogue' | 'sfx' | 'text' | 'stat' | 'section' | 'divider';
  text: string;
  characterId?: string;
  number?: string;
  label?: string;
}

interface ParsedPanel {
  panelType: MangaPanelType;
  effect: string;
  lines: ContentLine[];
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function parseMangaPanel(content: string): ParsedPanel {
  const rawLines = content.split('\n');
  let panelType: MangaPanelType = 'narrative';
  let effect = '';
  let startIndex = 0;

  if (rawLines.length > 0) {
    const firstLine = rawLines[0].trim();
    const typeMatch = firstLine.match(/^\[type:(\w+)(?:\s+effect:(\w+))?\]$/);
    if (typeMatch) {
      panelType = typeMatch[1] as MangaPanelType;
      effect = typeMatch[2] || '';
      startIndex = 1;
    }
    const oldMatch = firstLine.match(/^\[panel(?::([\w]+))?\]$/);
    if (oldMatch) {
      panelType = 'narrative';
      effect = oldMatch[1] || '';
      startIndex = 1;
    }
  }

  const lines: ContentLine[] = [];
  for (let i = startIndex; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (!trimmed) continue;

    if (/^──\s+.+\s+──$/.test(trimmed)) {
      const sectionText = trimmed.replace(/^──\s+/, '').replace(/\s+──$/, '');
      lines.push({ type: 'section', text: sectionText });
      continue;
    }
    if (/^───+$/.test(trimmed)) {
      lines.push({ type: 'divider', text: '' });
      continue;
    }
    if (/^\*\(.*\)\*$/.test(trimmed)) {
      lines.push({ type: 'narration', text: trimmed.slice(2, -2) });
      continue;
    }
    if (/^\*\*.+\*\*$/.test(trimmed)) {
      lines.push({ type: 'sfx', text: trimmed.slice(2, -2) });
      continue;
    }
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length === 2) {
        lines.push({ type: 'stat', text: trimmed, number: parts[0], label: parts[1] });
        continue;
      }
    }
    const dialogueMatch = trimmed.match(/^([\w-]+):\s*[""\u201C]?(.+?)[""\u201D]?\s*$/);
    if (dialogueMatch) {
      lines.push({ type: 'dialogue', characterId: dialogueMatch[1], text: dialogueMatch[2] });
      continue;
    }
    lines.push({ type: 'text', text: trimmed });
  }

  return { panelType, effect, lines };
}

/** Render inline bold (**text**) */
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

// ─── Shared Layer Components ─────────────────────────────────────────────────

/** L0: Atmospheric gradient background */
function AtmosphericBg({ accent, variant = 'dark' }: { accent: string; variant?: 'dark' | 'light' }) {
  if (variant === 'light') {
    return (
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 25% 20%, ${accent}18 0%, transparent 55%),
          radial-gradient(ellipse at 75% 80%, ${accent}10 0%, transparent 55%),
          linear-gradient(180deg, #f8f8fc 0%, #eeeef5 50%, #e8e8f0 100%)
        `,
      }} />
    );
  }
  return (
    <div className="absolute inset-0" style={{
      background: `
        radial-gradient(ellipse at 30% 20%, ${accent}30 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, ${accent}15 0%, transparent 50%),
        linear-gradient(180deg, #08081a 0%, #12122e 50%, #08081a 100%)
      `,
    }} />
  );
}

/** L1: Ken Burns slow zoom + pan */
function KenBurnsLayer({ accent, isActive, children }: { accent: string; isActive: boolean; children?: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-[-20px]"
      initial={{ scale: 1, x: 0, y: 0 }}
      animate={isActive ? { scale: 1.08, x: -5, y: -3 } : {}}
      transition={{ duration: 12, ease: 'linear' }}
    >
      {children || (
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 20% 30%, ${accent}20 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, ${accent}10 0%, transparent 50%)
          `,
        }} />
      )}
    </motion.div>
  );
}

/** L2: Vignette overlay */
function Vignette({ intensity = 0.6 }: { intensity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${intensity}) 100%)`,
    }} />
  );
}

/** L3: Bottom text safe zone gradient */
function BottomGradient({ height = '50%' }: { height?: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
      height,
      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
    }} />
  );
}

/** L5: Film grain texture overlay */
function FilmGrain() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay"
      style={{
        opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/** Cinematic letterbox bars */
function Letterbox({ isActive, delay = 0.2 }: { isActive: boolean; delay?: number }) {
  return (
    <>
      <motion.div
        className="absolute top-0 left-0 right-0 bg-black z-30"
        initial={{ height: 0 }}
        animate={isActive ? { height: '10%' } : {}}
        transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black z-30"
        initial={{ height: 0 }}
        animate={isActive ? { height: '10%' } : {}}
        transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
}

/** Narration caption badge */
function NarrationCaption({ text, isActive, delay, position = 'top' }: {
  text: string; isActive: boolean; delay: number; position?: 'top' | 'bottom';
}) {
  return (
    <motion.div
      className={`absolute left-4 ${position === 'top' ? 'top-16' : 'bottom-6'} z-40`}
      initial={{ opacity: 0, x: -10 }}
      animate={isActive ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay }}
    >
      <span
        className="inline-block rounded-md px-3 py-1.5 text-xs font-medium tracking-wide"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.85)',
          wordBreak: 'keep-all',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/** Count-up number animation */
function CountUp({ target, isActive }: { target: string; isActive: boolean }) {
  const numericPart = target.replace(/[^0-9.]/g, '');
  const suffix = target.replace(/[0-9.,]/g, '');
  const prefix = target.match(/^[^0-9]*/)?.[0] || '';
  const numVal = parseFloat(numericPart) || 0;

  const count = useMotionValue(0);
  const display = useTransform(count, (v) => {
    const rounded = numVal >= 100 ? Math.round(v).toLocaleString() : Math.round(v * 10) / 10;
    return `${prefix}${rounded}${suffix}`;
  });

  const [displayStr, setDisplayStr] = useState(target);

  useEffect(() => {
    if (isActive && numVal > 0) {
      count.set(0);
      const controls = animate(count, numVal, { duration: 1.5, ease: 'easeOut' });
      const unsub = display.on('change', (v) => setDisplayStr(v));
      return () => { controls.stop(); unsub(); };
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{isActive ? displayStr : target}</>;
}

// ─── Panel Renderers ─────────────────────────────────────────────────────────

/** 1. Narrative — Cinematic text reveal on dark atmospheric background */
function NarrativePanel({ lines, accent, isActive }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
}) {
  const narrations = lines.filter(l => l.type === 'narration');
  const textLines = lines.filter(l => l.type !== 'narration' && l.type !== 'divider');

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AtmosphericBg accent={accent} variant="dark" />
      <KenBurnsLayer accent={accent} isActive={isActive} />
      <Vignette intensity={0.5} />
      <BottomGradient height="40%" />
      <FilmGrain />

      {/* Narration captions */}
      {narrations.map((n, i) => (
        <NarrationCaption key={i} text={n.text} isActive={isActive} delay={0.2 + i * 0.2} />
      ))}

      {/* Text content — centered with large readable text */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-6 z-20">
        <div className="flex flex-col items-center gap-3 max-w-[90%]">
          {textLines.map((line, i) => (
            <motion.p
              key={i}
              className="text-center text-xl leading-relaxed font-medium"
              style={{
                color: 'rgba(255,255,255,0.9)',
                wordBreak: 'keep-all',
                textWrap: 'balance' as 'balance',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.4 + i * 0.4, duration: 0.6 }}
            >
              {parseInlineBold(line.text, accent)}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 2. Dialogue — Chat-thread bubbles with staggered pop */
function DialoguePanel({ lines, accent, isActive, findChar, speakerOrder }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
  findChar: (id: string) => Character; speakerOrder: string[];
}) {
  const narrations = lines.filter(l => l.type === 'narration');
  const contentLines = lines.filter(l => l.type !== 'narration');

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AtmosphericBg accent={accent} />
      <KenBurnsLayer accent={accent} isActive={isActive} />
      <Vignette intensity={0.4} />
      <FilmGrain />

      {narrations.map((n, i) => (
        <NarrationCaption key={i} text={n.text} isActive={isActive} delay={0.2 + i * 0.2} />
      ))}

      {/* Dialogue content — lower-center positioning for natural chat feel */}
      <div className="absolute inset-0 flex flex-col justify-end gap-4 px-5 pb-[25%] z-20">
        {contentLines.map((line, i) => {
          const delay = 0.4 + i * 0.4;

          if (line.type === 'dialogue' && line.characterId) {
            const character = findChar(line.characterId);
            const sideIndex = speakerOrder.indexOf(line.characterId);
            const isRight = sideIndex % 2 === 1;

            return (
              <motion.div
                key={i}
                className={`flex items-end gap-3 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={isActive ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
              >
                {/* Avatar with emotion glow */}
                <div className="relative shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-full blur-lg"
                    style={{ backgroundColor: accent }}
                    animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: delay + 0.5 }}
                  />
                  <div className="relative w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: `2px solid ${accent}40` }}>
                    <span className="text-2xl">{character.emoji}</span>
                  </div>
                </div>

                {/* Bubble with squash-and-stretch */}
                <div className="max-w-[75%]">
                  <span className={`block text-xs font-semibold mb-1 ${isRight ? 'text-right' : 'text-left'}`}
                    style={{ color: accent }}>
                    {character.name}
                  </span>
                  <motion.div
                    className="relative rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      boxShadow: `4px 4px 0px ${accent}40, 0 8px 24px rgba(0,0,0,0.3)`,
                      border: `2px solid ${accent}30`,
                    }}
                    initial={{ scaleX: 0.3, scaleY: 0.1, originY: 1 }}
                    animate={isActive ? {
                      scaleX: [0.3, 1.08, 0.96, 1],
                      scaleY: [0.1, 0.88, 1.04, 1],
                    } : {}}
                    transition={{ duration: 0.5, delay: delay + 0.1, times: [0, 0.5, 0.75, 1] }}
                  >
                    <p className="text-base font-bold text-gray-900" style={{ wordBreak: 'keep-all' }}>
                      {parseInlineBold(line.text, accent)}
                    </p>
                    {/* Tail */}
                    <div className="absolute -bottom-2"
                      style={{
                        [isRight ? 'right' : 'left']: '16px',
                        width: 0, height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: `8px solid ${accent}30`,
                      }}
                    />
                    <div className="absolute"
                      style={{
                        [isRight ? 'right' : 'left']: '18px',
                        bottom: '-5px',
                        width: 0, height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderTop: '6px solid rgba(255,255,255,0.95)',
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          }

          if (line.type === 'text') {
            return (
              <motion.p
                key={i}
                className="text-center text-sm"
                style={{ color: 'rgba(255,255,255,0.6)', wordBreak: 'keep-all' }}
                initial={{ opacity: 0, y: 6 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          if (line.type === 'sfx') {
            return (
              <motion.div key={i} className="flex justify-center">
                <SfxText text={line.text} accent={accent} isActive={isActive} delay={delay} />
              </motion.div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/** SFX explosive typography */
function SfxText({ text, accent, isActive, delay }: {
  text: string; accent: string; isActive: boolean; delay: number;
}) {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ scale: 2.5, opacity: 0, rotate: -12 }}
      animate={isActive ? {
        scale: [2.5, 0.9, 1.05, 1],
        opacity: 1,
        rotate: [-12, 3, -1, 0],
      } : {}}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <span style={{
        fontSize: 'clamp(2rem, 12vw, 4rem)',
        fontWeight: 900,
        color: accent,
        textShadow: `
          3px 3px 0 rgba(0,0,0,0.8),
          -1px -1px 0 rgba(0,0,0,0.5),
          0 0 20px ${accent}60,
          0 0 40px ${accent}30
        `,
        letterSpacing: '0.05em',
        wordBreak: 'keep-all',
      }}>
        {text}
      </span>
    </motion.div>
  );
}

/** 3. Action — Focus lines + SFX + shake */
function ActionPanel({ lines, effect, accent, isActive, findChar, speakerOrder }: {
  lines: ContentLine[]; effect: string; accent: string; isActive: boolean;
  findChar: (id: string) => Character; speakerOrder: string[];
}) {
  const narrations = lines.filter(l => l.type === 'narration');
  const contentLines = lines.filter(l => l.type !== 'narration');

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AtmosphericBg accent={accent} />
      <KenBurnsLayer accent={accent} isActive={isActive} />

      {/* Focus/Impact lines — CSS conic-gradient (high contrast) */}
      {(effect === 'focus' || effect === 'impact') && (
        <motion.div
          className="absolute inset-[-50%] pointer-events-none"
          style={{
            background: `conic-gradient(
              from 0deg at 50% 50%,
              ${effect === 'impact' ? accent + '50' : 'rgba(255,255,255,0.15)'} 0deg,
              transparent 4deg, transparent 14deg,
              ${effect === 'impact' ? accent + '50' : 'rgba(255,255,255,0.15)'} 18deg,
              transparent 22deg
            )`,
          }}
          initial={{ scale: 0.3, opacity: 0, rotate: 0 }}
          animate={isActive ? { scale: 1.2, opacity: 1, rotate: 3 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        />
      )}

      {effect === 'speed' && (
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px)',
        }} />
      )}

      <Vignette intensity={effect === 'impact' ? 0.7 : 0.5} />
      <FilmGrain />

      {narrations.map((n, i) => (
        <NarrationCaption key={i} text={n.text} isActive={isActive} delay={0.2 + i * 0.2} />
      ))}

      {/* Content with micro-shake */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 z-20"
        initial={{ x: 0 }}
        animate={isActive && effect === 'impact' ? { x: [0, -4, 4, -3, 3, 0] } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {contentLines.map((line, i) => {
          const delay = 0.4 + i * 0.2;

          if (line.type === 'sfx') {
            return <SfxText key={i} text={line.text} accent={accent} isActive={isActive} delay={delay} />;
          }

          if (line.type === 'dialogue' && line.characterId) {
            const character = findChar(line.characterId);
            const sideIndex = speakerOrder.indexOf(line.characterId);
            const isRight = sideIndex % 2 === 1;
            return (
              <motion.div
                key={i}
                className={`flex items-end gap-2 w-full ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isActive ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
              >
                <span className="text-3xl">{character.emoji}</span>
                <div className="rounded-xl px-4 py-2.5"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    boxShadow: `3px 3px 0 ${accent}40`,
                    border: `2px solid ${accent}30`,
                  }}>
                  <p className="text-sm font-bold text-gray-900" style={{ wordBreak: 'keep-all' }}>
                    {parseInlineBold(line.text, accent)}
                  </p>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.p
              key={i}
              className="text-center text-base"
              style={{ color: 'rgba(255,255,255,0.85)', wordBreak: 'keep-all' }}
              initial={{ opacity: 0, y: 8 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay }}
            >
              {parseInlineBold(line.text, accent)}
            </motion.p>
          );
        })}
      </motion.div>
    </div>
  );
}

/** 4. Data — Big number editorial style */
function DataPanel({ lines, accent, isActive }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
}) {
  const stats = lines.filter(l => l.type === 'stat');
  const textLines = lines.filter(l => l.type === 'text' || l.type === 'narration');

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AtmosphericBg accent={accent} />
      <KenBurnsLayer accent={accent} isActive={isActive} />
      <Vignette intensity={0.5} />
      <FilmGrain />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-5 z-20">
        {/* Narration caption */}
        {textLines.filter(l => l.type === 'narration').map((line, i) => (
          <NarrationCaption key={i} text={line.text} isActive={isActive} delay={0.2} />
        ))}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-[85%]">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center rounded-xl py-4 px-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${accent}25`,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isActive ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 + i * 0.15 }}
            >
              <span
                className="font-black leading-none"
                style={{
                  fontSize: 'clamp(1.8rem, 8vw, 2.8rem)',
                  color: '#fff',
                  textShadow: `0 0 20px ${accent}, 0 0 40px ${accent}80, 0 2px 4px rgba(0,0,0,0.5)`,
                  wordBreak: 'keep-all',
                }}
              >
                <CountUp target={stat.number || ''} isActive={isActive} />
              </span>
              <span className="text-xs mt-2 text-center font-medium"
                style={{ color: accent, wordBreak: 'keep-all' }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Footer text */}
        {textLines.filter(l => l.type === 'text').map((line, i) => (
          <motion.p
            key={i}
            className="text-center text-sm"
            style={{ color: 'rgba(255,255,255,0.5)', wordBreak: 'keep-all' }}
            initial={{ opacity: 0, y: 6 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
          >
            {parseInlineBold(line.text, accent)}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

/** 5. Versus — Diagonal split with sliding panels */
function VersusPanel({ lines, accent, isActive }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
}) {
  const statLines = lines.filter(l => l.type === 'stat');
  const headerLine = statLines[0] || null;
  const dataLines = statLines.slice(1);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: '#08081a' }}>
      {/* Diagonal split — left (light) */}
      <motion.div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          background: `linear-gradient(135deg, ${accent}25 0%, ${accent}08 100%)`,
        }}
        initial={{ x: '-100%' }}
        animate={isActive ? { x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
      {/* Diagonal split — right (dark) */}
      <motion.div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          background: `linear-gradient(315deg, ${accent}10 0%, rgba(20,20,50,0.8) 100%)`,
        }}
        initial={{ x: '100%' }}
        animate={isActive ? { x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      {/* Diagonal border line */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `linear-gradient(135deg,
            transparent calc(50% - 1.5px),
            ${accent} calc(50% - 1.5px),
            ${accent} calc(50% + 1.5px),
            transparent calc(50% + 1.5px)
          )`,
        }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 0.5 } : {}}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <Vignette intensity={0.3} />
      <FilmGrain />

      {/* VS badge */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: '#000', border: `3px solid ${accent}`,
          boxShadow: `0 0 20px ${accent}60, 0 0 40px ${accent}30`,
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={isActive ? { scale: 1, rotate: 0 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.6 }}
      >
        <span className="text-sm font-black" style={{ color: accent }}>VS</span>
      </motion.div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-5 py-8">
        {/* Header row */}
        {headerLine && (
          <motion.div
            className="flex w-full justify-between px-4 mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <span className="text-base font-black" style={{ color: accent, wordBreak: 'keep-all' }}>
              {headerLine.number}
            </span>
            <span className="text-base font-black text-white" style={{ wordBreak: 'keep-all' }}>
              {headerLine.label}
            </span>
          </motion.div>
        )}

        {dataLines.map((line, i) => (
          <motion.div
            key={i}
            className="flex w-full justify-between px-4 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
          >
            <span className="text-sm" style={{ color: `${accent}cc`, wordBreak: 'keep-all' }}>
              {line.number}
            </span>
            <span className="text-sm text-white/80" style={{ wordBreak: 'keep-all' }}>
              {line.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** 6. Revelation — Letterbox + radial burst + text mask reveal */
function RevelationPanel({ lines, accent, isActive }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: '#000' }}>
      {/* Radial burst */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${accent}40 0%, ${accent}15 30%, transparent 60%)`,
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={isActive ? { scale: [0.2, 1.3, 1], opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      />
      <KenBurnsLayer accent={accent} isActive={isActive} />
      <Vignette intensity={0.6} />
      <Letterbox isActive={isActive} delay={0.1} />
      <FilmGrain />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 z-20">
        {lines.map((line, i) => {
          const delay = 0.5 + i * 0.2;

          if (line.type === 'divider') {
            return (
              <motion.div
                key={i}
                className="h-px w-16 mx-auto"
                style={{ backgroundColor: `${accent}60` }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={isActive ? { scaleX: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay }}
              />
            );
          }

          if (line.type === 'sfx') {
            return (
              <motion.p
                key={i}
                className="text-center font-black"
                style={{
                  fontSize: 'clamp(1.5rem, 8vw, 2.5rem)',
                  color: accent,
                  textShadow: `0 0 8px ${accent}, 0 0 16px ${accent}80, 0 0 32px ${accent}40`,
                  wordBreak: 'keep-all',
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isActive ? { opacity: 1, scale: [0.6, 1.08, 1] } : {}}
                transition={{ duration: 0.6, delay }}
              >
                {line.text}
              </motion.p>
            );
          }

          if (line.type === 'text') {
            const isFirst = lines.filter(l => l.type === 'text').indexOf(line) === 0;
            return (
              <motion.p
                key={i}
                className={`text-center font-bold ${isFirst ? 'text-xl' : 'text-base'}`}
                style={{
                  color: isFirst ? '#fff' : 'rgba(255,255,255,0.7)',
                  wordBreak: 'keep-all',
                  textWrap: 'balance' as 'balance',
                }}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.6, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/** 7. Montage — Vertical timeline cards */
function MontagePanel({ lines, accent, isActive }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
}) {
  const sectionTitle = lines.find(l => l.type === 'section');
  const contentLines = lines.filter(l => l.type !== 'section' && l.type !== 'divider');
  const frameLines: ContentLine[] = [];
  let footerLine: ContentLine | null = null;

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    if (i === contentLines.length - 1 && line.type === 'sfx') {
      footerLine = line;
    } else if (i === contentLines.length - 1 && line.type === 'text' && /\*\*.+\*\*/.test(line.text)) {
      footerLine = line;
    } else {
      frameLines.push(line);
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: '#08081a' }}>
      <KenBurnsLayer accent={accent} isActive={isActive} />
      <Vignette intensity={0.4} />
      <FilmGrain />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 px-5 z-20">
        {/* Section title */}
        {sectionTitle && (
          <motion.span
            className="mb-4 text-xs uppercase tracking-[0.2em] font-medium"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {sectionTitle.text}
          </motion.span>
        )}

        {/* Timeline line */}
        <div className="relative flex flex-col items-center gap-2 w-[85%]">
          {frameLines.length > 1 && (
            <motion.div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] pointer-events-none"
              style={{ background: `linear-gradient(to bottom, transparent, ${accent}40, transparent)` }}
              initial={{ scaleY: 0 }}
              animate={isActive ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          )}

          {frameLines.map((line, i) => (
            <motion.div
              key={i}
              className="relative z-10 w-full rounded-xl px-4 py-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${accent}20`,
              }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.85)', wordBreak: 'keep-all' }}>
                {parseInlineBold(line.text, accent)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        {footerLine && (
          <motion.p
            className="mt-4 text-center text-base font-black"
            style={{ color: accent, wordBreak: 'keep-all', textShadow: `0 0 12px ${accent}40` }}
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.5 + frameLines.length * 0.15 }}
          >
            {footerLine.type === 'sfx' ? footerLine.text : parseInlineBold(footerLine.text, accent)}
          </motion.p>
        )}
      </div>
    </div>
  );
}

/** 8. Closeup — Dramatic zoom with character focus */
function CloseupPanel({ lines, accent, isActive, findChar }: {
  lines: ContentLine[]; accent: string; isActive: boolean;
  findChar: (id: string) => Character;
}) {
  const dialogueLine = lines.find(l => l.type === 'dialogue');
  const character = dialogueLine?.characterId ? findChar(dialogueLine.characterId) : null;
  const emoji = character?.emoji || '💬';

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AtmosphericBg accent={accent} />
      <KenBurnsLayer accent={accent} isActive={isActive} />

      {/* Radial focus lines — conic gradient (high contrast) */}
      <motion.div
        className="absolute inset-[-30%] pointer-events-none"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 50%,
            rgba(255,255,255,0.12) 0deg, transparent 4deg,
            transparent 18deg, rgba(255,255,255,0.12) 22deg,
            transparent 26deg
          )`,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isActive ? { opacity: 1, scale: 1.3 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      <Vignette intensity={0.5} />
      <FilmGrain />

      {/* Character emoji watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={isActive ? { scale: 1, opacity: 0.08 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
      >
        <span style={{ fontSize: '12rem' }}>{emoji}</span>
      </motion.div>

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 z-20">
        {lines.map((line, i) => {
          const delay = 0.5 + i * 0.2;

          if (line.type === 'dialogue') {
            return (
              <motion.p
                key={i}
                className="text-center text-xl font-black text-white"
                style={{
                  wordBreak: 'keep-all',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  textWrap: 'balance' as 'balance',
                }}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={isActive ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          if (line.type === 'narration') {
            return <NarrationCaption key={i} text={line.text} isActive={isActive} delay={delay} />;
          }

          if (line.type === 'text') {
            return (
              <motion.p
                key={i}
                className="text-center text-lg font-bold text-white"
                style={{ wordBreak: 'keep-all', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MangaSceneStep({ step, card, isActive }: MangaSceneStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const accent = categoryInfo.accent;

  const parsed = useMemo(() => parseMangaPanel(step.content), [step.content]);

  const speakerOrder = useMemo(() => {
    const order: string[] = [];
    for (const line of parsed.lines) {
      if (line.type === 'dialogue' && line.characterId && !order.includes(line.characterId)) {
        order.push(line.characterId);
      }
    }
    return order;
  }, [parsed.lines]);

  const findChar = (id: string): Character =>
    card.characters?.find(c => c.id === id) ?? { id, name: id, emoji: '\uD83D\uDCAC' };

  const commonProps = { lines: parsed.lines, accent, isActive };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {parsed.panelType === 'narrative' && <NarrativePanel {...commonProps} />}
      {parsed.panelType === 'dialogue' && (
        <DialoguePanel {...commonProps} findChar={findChar} speakerOrder={speakerOrder} />
      )}
      {parsed.panelType === 'action' && (
        <ActionPanel {...commonProps} effect={parsed.effect} findChar={findChar} speakerOrder={speakerOrder} />
      )}
      {parsed.panelType === 'data' && <DataPanel {...commonProps} />}
      {parsed.panelType === 'versus' && <VersusPanel {...commonProps} />}
      {parsed.panelType === 'revelation' && <RevelationPanel {...commonProps} />}
      {parsed.panelType === 'montage' && <MontagePanel {...commonProps} />}
      {parsed.panelType === 'closeup' && <CloseupPanel {...commonProps} findChar={findChar} />}
    </div>
  );
}
