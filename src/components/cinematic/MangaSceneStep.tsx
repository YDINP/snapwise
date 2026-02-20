'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
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

  // Check first line for [type:xxx] or [type:xxx effect:yyy]
  if (rawLines.length > 0) {
    const firstLine = rawLines[0].trim();
    const typeMatch = firstLine.match(/^\[type:(\w+)(?:\s+effect:(\w+))?\]$/);
    if (typeMatch) {
      panelType = typeMatch[1] as MangaPanelType;
      effect = typeMatch[2] || '';
      startIndex = 1;
    }
    // Backward compat: old [panel] / [panel:xxx] format — treat as narrative
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

    // Section title: ── text ──
    if (/^──\s+.+\s+──$/.test(trimmed)) {
      const sectionText = trimmed.replace(/^──\s+/, '').replace(/\s+──$/, '');
      lines.push({ type: 'section', text: sectionText });
      continue;
    }

    // Divider: ───
    if (/^───+$/.test(trimmed)) {
      lines.push({ type: 'divider', text: '' });
      continue;
    }

    // Narration caption: *(text)*
    if (/^\*\(.*\)\*$/.test(trimmed)) {
      lines.push({ type: 'narration', text: trimmed.slice(2, -2) });
      continue;
    }

    // SFX / onomatopoeia: **text**
    if (/^\*\*.+\*\*$/.test(trimmed)) {
      lines.push({ type: 'sfx', text: trimmed.slice(2, -2) });
      continue;
    }

    // Stat: number|label (for data/versus panels)
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length === 2) {
        lines.push({ type: 'stat', text: trimmed, number: parts[0], label: parts[1] });
        continue;
      }
    }

    // Character dialogue: characterId: "text" or characterId: text
    const dialogueMatch = trimmed.match(/^([\w-]+):\s*[""\u201C]?(.+?)[""\u201D]?\s*$/);
    if (dialogueMatch) {
      lines.push({ type: 'dialogue', characterId: dialogueMatch[1], text: dialogueMatch[2] });
      continue;
    }

    // Plain text
    lines.push({ type: 'text', text: trimmed });
  }

  return { panelType, effect, lines };
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

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

function RadialLines({
  count,
  innerR,
  outerR,
  strokeColor,
  strokeWidth,
  opacity,
}: {
  count: number;
  innerR: number;
  outerR: number;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}) {
  const lines = Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: 50 + innerR * Math.cos(rad),
      y1: 50 + innerR * Math.sin(rad),
      x2: 50 + outerR * Math.cos(rad),
      y2: 50 + outerR * Math.sin(rad),
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
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      ))}
    </svg>
  );
}

function Screentone({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, #000 0.8px, transparent 0.8px)',
        backgroundSize: '16px 16px',
        opacity,
      }}
    />
  );
}

function StarBurst({ color, opacity = 0.15 }: { color: string; opacity?: number }) {
  const points = 12;
  const outerR = 45;
  const innerR = 20;
  const d = Array.from({ length: points * 2 }, (_, i) => {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ') + 'Z';

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ opacity }}
    >
      <path d={d} fill={color} />
    </svg>
  );
}

// ─── Panel Renderers ─────────────────────────────────────────────────────────

/** 1. Narrative (나레이션) — Default */
function NarrativePanel({
  lines,
  accent,
  isActive,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ backgroundColor: '#000' }}>
      {/* White inner frame */}
      <motion.div
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{
          position: 'absolute',
          inset: '12px',
          backgroundColor: '#fff',
          border: '2px solid #000',
          borderRadius: '4px',
        }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Screentone />

        {/* Content */}
        <div className="relative z-10 flex h-full w-full flex-col justify-center px-5 py-4">
          {lines.map((line, i) => {
            const delay = 0.3 + i * 0.15;

            if (line.type === 'narration') {
              return (
                <motion.div
                  key={i}
                  className="absolute left-3 top-3 z-20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay }}
                >
                  <span
                    className="inline-block rounded px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', wordBreak: 'keep-all' }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              );
            }

            if (line.type === 'sfx') {
              return (
                <motion.div
                  key={i}
                  className="flex items-center justify-center my-1"
                  initial={{ opacity: 0, scale: 1.4 }}
                  animate={isActive ? { opacity: 1, scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay }}
                >
                  <span
                    className="text-3xl font-black"
                    style={{
                      color: accent,
                      textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                      transform: 'rotate(-8deg)',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.p
                key={i}
                className="text-center text-base text-gray-800 leading-relaxed my-1"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0, y: 8 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/** 2. Dialogue (대사) */
function DialoguePanel({
  lines,
  accent,
  isActive,
  findChar,
  speakerOrder,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
  findChar: (id: string) => Character;
  speakerOrder: string[];
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ backgroundColor: '#000' }}>
      <motion.div
        className="relative flex flex-col overflow-hidden"
        style={{
          position: 'absolute',
          inset: '12px',
          backgroundColor: '#fff',
          border: '2px solid #000',
          borderRadius: '4px',
        }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Screentone />

        <div className="relative z-10 flex h-full w-full flex-col justify-end gap-3 px-4 py-4">
          {lines.map((line, i) => {
            const delay = 0.3 + i * 0.18;

            if (line.type === 'narration') {
              return (
                <motion.div
                  key={i}
                  className="absolute left-3 top-3 z-20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay }}
                >
                  <span
                    className="inline-block rounded px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', wordBreak: 'keep-all' }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              );
            }

            if (line.type === 'text') {
              return (
                <motion.p
                  key={i}
                  className="text-center text-sm text-gray-600"
                  style={{ wordBreak: 'keep-all' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={isActive ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay }}
                >
                  {parseInlineBold(line.text, accent)}
                </motion.p>
              );
            }

            if (line.type === 'dialogue' && line.characterId) {
              const character = findChar(line.characterId);
              const sideIndex = speakerOrder.indexOf(line.characterId);
              const isRight = sideIndex % 2 === 1;

              return (
                <div key={i} className={`flex items-end gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <motion.div
                    className="shrink-0 text-5xl leading-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay }}
                  >
                    {character.emoji}
                  </motion.div>

                  {/* Bubble */}
                  <motion.div
                    className="relative max-w-[75%]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isActive ? { opacity: 1, scale: 1 } : {}}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: delay + 0.1 }}
                  >
                    {/* Name tag */}
                    <span
                      className={`mb-0.5 block text-xs font-bold ${isRight ? 'text-right' : 'text-left'}`}
                      style={{ color: accent }}
                    >
                      {character.name}
                    </span>

                    {/* Speech bubble */}
                    <div
                      className="relative rounded-2xl px-4 py-3"
                      style={{
                        backgroundColor: '#fff',
                        border: '2px solid #000',
                      }}
                    >
                      <p
                        className="text-base font-bold text-gray-900"
                        style={{ wordBreak: 'keep-all' }}
                      >
                        {parseInlineBold(line.text, accent)}
                      </p>

                      {/* Tail */}
                      <div
                        className="absolute -bottom-2"
                        style={{
                          [isRight ? 'right' : 'left']: '16px',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '8px solid #000',
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          [isRight ? 'right' : 'left']: '18px',
                          bottom: '-5px',
                          width: 0,
                          height: 0,
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          borderTop: '6px solid #fff',
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </motion.div>
    </div>
  );
}

/** 3. Action (액션/SFX) */
function ActionPanel({
  lines,
  effect,
  accent,
  isActive,
  findChar,
  speakerOrder,
}: {
  lines: ContentLine[];
  effect: string;
  accent: string;
  isActive: boolean;
  findChar: (id: string) => Character;
  speakerOrder: string[];
}) {
  const frameStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '12px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '4px',
    ...(effect === 'impact'
      ? { clipPath: 'polygon(2% 0%, 98% 3%, 100% 97%, 3% 100%)' }
      : {}),
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ backgroundColor: '#000' }}>
      <motion.div
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={frameStyle}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Effect overlays */}
        {effect === 'focus' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <RadialLines count={20} innerR={5} outerR={70} strokeColor="black" strokeWidth={1.5} opacity={0.15} />
          </motion.div>
        )}

        {effect === 'speed' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 9px)',
            }}
          />
        )}

        <Screentone />

        {/* Micro-shake wrapper */}
        <motion.div
          className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-4"
          initial={{ x: 0 }}
          animate={isActive ? { x: [0, -3, 3, -2, 2, 0] } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        >
          {lines.map((line, i) => {
            const delay = 0.3 + i * 0.15;

            if (line.type === 'narration') {
              return (
                <motion.div
                  key={i}
                  className="absolute left-3 top-3 z-20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay }}
                >
                  <span
                    className="inline-block rounded px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', wordBreak: 'keep-all' }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              );
            }

            if (line.type === 'sfx') {
              return (
                <motion.div
                  key={i}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 1.4 }}
                  animate={isActive ? { opacity: 1, scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay }}
                >
                  <span
                    className="text-3xl font-black sm:text-4xl"
                    style={{
                      color: accent,
                      textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                      transform: 'rotate(-8deg)',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              );
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
                  <span className="text-2xl">{character.emoji}</span>
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{ backgroundColor: '#fff', border: '2px solid #000' }}
                  >
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
                className="text-center text-sm text-gray-600"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0, y: 6 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** 4. Data (데이터) */
function DataPanel({
  lines,
  accent,
  isActive,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
}) {
  const stats = lines.filter(l => l.type === 'stat');
  const textLines = lines.filter(l => l.type !== 'stat');

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0a0a0a', border: '2px solid #fff', borderRadius: '4px' }}
    >
      {/* Star burst behind main number */}
      {stats.length > 0 && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0 }}
          animate={isActive ? { scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <StarBurst color={accent} opacity={0.15} />
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 px-5 py-4">
        {/* Caption/narration at top */}
        {textLines.map((line, i) => {
          if (line.type === 'narration') {
            return (
              <motion.div
                key={`t-${i}`}
                className="absolute left-3 top-3 z-20"
                initial={{ opacity: 0, x: -10 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <span
                  className="inline-block rounded px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', wordBreak: 'keep-all' }}
                >
                  {line.text}
                </span>
              </motion.div>
            );
          }
          return null;
        })}

        {stats.map((stat, i) => {
          const isMain = i === 0;
          const delay = 0.3 + i * 0.2;

          return (
            <motion.div
              key={`s-${i}`}
              className="flex flex-col items-center"
              style={{
                borderLeft: `3px solid ${accent}`,
                paddingLeft: '12px',
              }}
              initial={{ opacity: 0, scale: isMain ? 0.7 : 0.9 }}
              animate={isActive ? { opacity: 1, scale: 1 } : {}}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay,
              }}
            >
              <span
                className={`font-black ${isMain ? 'text-5xl' : 'text-2xl'}`}
                style={{
                  color: accent,
                  textShadow: isMain ? `0 0 20px ${accent}4D` : undefined,
                  wordBreak: 'keep-all',
                }}
              >
                {stat.number}
              </span>
              <span
                className="text-sm mt-1"
                style={{ color: 'rgba(255,255,255,0.7)', wordBreak: 'keep-all' }}
              >
                {stat.label}
              </span>
            </motion.div>
          );
        })}

        {/* Footer text lines */}
        {textLines
          .filter(l => l.type === 'text')
          .map((line, i) => (
            <motion.p
              key={`ft-${i}`}
              className="text-center text-sm"
              style={{ color: 'rgba(255,255,255,0.7)', wordBreak: 'keep-all' }}
              initial={{ opacity: 0, y: 6 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            >
              {parseInlineBold(line.text, accent)}
            </motion.p>
          ))}
      </div>
    </div>
  );
}

/** 5. Versus (비교) */
function VersusPanel({
  lines,
  accent,
  isActive,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
}) {
  const statLines = lines.filter(l => l.type === 'stat');
  const headerLine = statLines.length > 0 ? statLines[0] : null;
  const dataLines = statLines.slice(1);

  return (
    <div className="relative flex h-full w-full overflow-hidden" style={{ backgroundColor: '#000' }}>
      {/* Top-left triangle: white + screentone */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: '#fff',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
        initial={{ x: -40, opacity: 0 }}
        animate={isActive ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Screentone />
      </motion.div>

      {/* Bottom-right triangle: dark accent tint */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: `${accent}1A`,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
        initial={{ x: 40, opacity: 0 }}
        animate={isActive ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-4">
        {/* Header row */}
        {headerLine && (
          <motion.div
            className="flex w-full justify-between px-6"
            initial={{ opacity: 0, y: -10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <span
              className="text-base font-black text-gray-900"
              style={{ wordBreak: 'keep-all' }}
            >
              {headerLine.number}
            </span>
            <span
              className="text-base font-black text-white"
              style={{ wordBreak: 'keep-all' }}
            >
              {headerLine.label}
            </span>
          </motion.div>
        )}

        {/* Data rows */}
        {dataLines.map((line, i) => (
          <motion.div
            key={i}
            className="flex w-full justify-between px-6"
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          >
            <span className="text-sm text-gray-800" style={{ wordBreak: 'keep-all' }}>
              {line.number}
            </span>
            <span className="text-sm text-white/90" style={{ wordBreak: 'keep-all' }}>
              {line.label}
            </span>
          </motion.div>
        ))}

        {/* Non-stat text lines */}
        {lines
          .filter(l => l.type === 'text' || l.type === 'narration')
          .map((line, i) => (
            <motion.p
              key={`vt-${i}`}
              className="text-center text-xs text-white/60"
              style={{ wordBreak: 'keep-all' }}
              initial={{ opacity: 0 }}
              animate={isActive ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              {line.type === 'narration' ? line.text : parseInlineBold(line.text, accent)}
            </motion.p>
          ))}
      </div>

      {/* VS badge */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#000',
          border: `2px solid ${accent}`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0 }}
        animate={isActive ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.6 }}
      >
        <span className="text-xs font-black" style={{ color: accent }}>
          VS
        </span>
      </motion.div>
    </div>
  );
}

/** 6. Revelation (반전/충격) */
function RevelationPanel({
  lines,
  accent,
  isActive,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Speed lines */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i * 360) / 20;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={`sl-${i}`}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              width: '2px',
              height: '150%',
              backgroundColor: `${accent}4D`,
              transformOrigin: 'center top',
              transform: `rotate(${angle}deg)`,
            }}
            initial={{ scaleY: 0 }}
            animate={isActive ? { scaleY: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.05 * (i % 5) }}
          />
        );
      })}

      {/* Radial burst */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}40 0%, transparent 60%)`,
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={isActive ? { scale: [0.3, 1.2, 1], opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      />

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-5 py-4">
        {lines.map((line, i) => {
          const delay = 0.5 + i * 0.15;

          if (line.type === 'divider') {
            return (
              <motion.div
                key={i}
                className="h-px w-12 mx-auto"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isActive ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.4, delay }}
              />
            );
          }

          if (line.type === 'sfx' || line.type === 'text') {
            const isMainText = line.type === 'sfx' || lines.filter(l => l.type === 'text').indexOf(line) === 0;
            return (
              <motion.p
                key={i}
                className={`text-center font-black text-white ${isMainText ? 'text-2xl sm:text-3xl' : 'text-base'}`}
                style={{
                  wordBreak: 'keep-all',
                  ...(isMainText ? {} : { opacity: 0.7 }),
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={isActive ? { opacity: isMainText ? 1 : 0.7, scale: [0.7, 1.05, 1] } : {}}
                transition={{ duration: 0.6, delay, ease: 'easeOut' }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          if (line.type === 'narration') {
            return (
              <motion.p
                key={i}
                className="text-center text-base text-white/70"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 0.7 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                {line.text}
              </motion.p>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/** 7. Montage (몽타주) */
function MontagePanel({
  lines,
  accent,
  isActive,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
}) {
  const sectionTitle = lines.find(l => l.type === 'section');
  const contentLines = lines.filter(l => l.type !== 'section' && l.type !== 'divider');
  // Split: regular text/narration/dialogue goes into mini frames, last bold-containing text = footer
  const frameLines: ContentLine[] = [];
  let footerLine: ContentLine | null = null;

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    // Last text line with bold = footer
    if (i === contentLines.length - 1 && line.type === 'text' && /\*\*.+\*\*/.test(line.text)) {
      footerLine = line;
    } else {
      frameLines.push(line);
    }
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-0 px-4 py-4">
        {/* Section title */}
        {sectionTitle && (
          <motion.span
            className="mb-3 text-xs uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.5)', wordBreak: 'keep-all' }}
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {sectionTitle.text}
          </motion.span>
        )}

        {/* Mini frames */}
        <div className="relative flex flex-col items-center gap-0 w-[85%]">
          {/* Dashed connecting line */}
          {frameLines.length > 1 && (
            <div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none"
              style={{
                borderLeft: '2px dashed rgba(255,255,255,0.2)',
              }}
            />
          )}

          {frameLines.map((line, i) => (
            <motion.div
              key={i}
              className="relative z-10 my-1 flex w-full items-center justify-center rounded-lg px-3 py-3"
              style={{
                minHeight: '72px',
                backgroundColor: '#fff',
                border: '2px solid #333',
                borderRadius: '8px',
              }}
              initial={{ opacity: 0, x: 30 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
            >
              <p
                className="text-center text-sm text-gray-800"
                style={{ wordBreak: 'keep-all' }}
              >
                {parseInlineBold(line.text, accent)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer bold text */}
        {footerLine && (
          <motion.p
            className="mt-3 text-center text-base font-black text-white"
            style={{ wordBreak: 'keep-all' }}
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 + frameLines.length * 0.15 }}
          >
            {parseInlineBold(footerLine.text, accent)}
          </motion.p>
        )}
      </div>
    </div>
  );
}

/** 8. Closeup (클로즈업) */
function CloseupPanel({
  lines,
  accent,
  isActive,
  findChar,
}: {
  lines: ContentLine[];
  accent: string;
  isActive: boolean;
  findChar: (id: string) => Character;
}) {
  // Find the character to feature
  const dialogueLine = lines.find(l => l.type === 'dialogue');
  const character = dialogueLine?.characterId ? findChar(dialogueLine.characterId) : null;
  const emoji = character?.emoji || '💬';

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#fafafa' }}
    >
      {/* Screentone gradient: top light → bottom dense */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 0.8px, transparent 0.8px)',
          backgroundSize: '16px 16px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.03), rgba(0,0,0,0.12))',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.03), rgba(0,0,0,0.12))',
          opacity: 1,
        }}
      />

      {/* Heavy focus lines */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <RadialLines count={16} innerR={10} outerR={70} strokeColor="#000" strokeWidth={3} opacity={0.08} />
      </motion.div>

      {/* Character emoji watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isActive ? { scale: 1, opacity: 0.12 } : {}}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
      >
        <span className="text-8xl">{emoji}</span>
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-5 py-4">
        {lines.map((line, i) => {
          const delay = 0.6 + i * 0.15;

          if (line.type === 'dialogue' && line.characterId) {
            // Closeup dialogue = centered dramatic text, no bubble
            return (
              <motion.p
                key={i}
                className="text-center text-xl font-black text-gray-900"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0, y: 10 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          if (line.type === 'narration') {
            return (
              <motion.span
                key={i}
                className="inline-block rounded px-3 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: 'rgba(0,0,0,0.85)', wordBreak: 'keep-all' }}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                {line.text}
              </motion.span>
            );
          }

          if (line.type === 'text') {
            return (
              <motion.p
                key={i}
                className="text-center text-xl font-black text-gray-900"
                style={{ wordBreak: 'keep-all' }}
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

  // Collect unique speakers for side assignment
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

  const commonProps = {
    lines: parsed.lines,
    accent,
    isActive,
  };

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
