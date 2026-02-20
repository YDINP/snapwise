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

/** Render inline bold (**text**) within regular text — accent color with glow */
function parseInlineBold(text: string, accentColor: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <strong
        key={`b-${match.index}`}
        className="font-bold"
        style={{
          color: accentColor,
          textShadow: `0 0 12px ${accentColor}66`,
        }}
      >
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

// ─── Panel Renderers ─────────────────────────────────────────────────────────

/** 1. Narrative (나레이션) — Kinetic Typography */
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
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)' }}
    >
      <div className="relative z-10 flex h-full w-full flex-col justify-center px-6 py-5">
        {lines.map((line, i) => {
          const delay = 0.2 + i * 0.15;

          if (line.type === 'narration') {
            return (
              <motion.div
                key={i}
                className="mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay }}
              >
                <span
                  className="text-xs tracking-wider uppercase"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    wordBreak: 'keep-all',
                  }}
                >
                  {line.text}
                </span>
                <motion.div
                  className="mt-1 h-px"
                  style={{ backgroundColor: accent }}
                  initial={{ scaleX: 0 }}
                  animate={isActive ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, delay: delay + 0.2 }}
                  // eslint-disable-next-line react/style-prop-object
                />
              </motion.div>
            );
          }

          if (line.type === 'sfx') {
            return (
              <motion.div
                key={i}
                className="flex items-center justify-center my-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isActive ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay }}
              >
                <span
                  className="text-4xl font-black"
                  style={{
                    color: accent,
                    textShadow: `0 0 30px ${accent}80, 0 0 60px ${accent}40`,
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
              className="text-center text-xl leading-relaxed my-1 text-white"
              style={{ wordBreak: 'keep-all' }}
              initial={{ opacity: 0, y: 15 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay }}
            >
              {parseInlineBold(line.text, accent)}
            </motion.p>
          );
        })}
      </div>
    </div>
  );
}

/** 2. Dialogue (대사) — Kinetic Typography */
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
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0a0a14, #141428)' }}
    >
      <div className="relative z-10 flex h-full w-full flex-col justify-center gap-6 px-5 py-5">
        {lines.map((line, i) => {
          const delay = 0.2 + i * 0.18;

          if (line.type === 'narration') {
            return (
              <motion.div
                key={i}
                className="flex items-center gap-2 mb-2"
                initial={{ opacity: 0, x: -15 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                <div
                  className="w-0.5 h-4 shrink-0"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="text-xs italic"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    wordBreak: 'keep-all',
                  }}
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
                className="text-center text-sm"
                style={{ color: 'rgba(255,255,255,0.5)', wordBreak: 'keep-all' }}
                initial={{ opacity: 0, y: 8 }}
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
              <motion.div
                key={i}
                className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay }}
              >
                {/* Emoji + Name */}
                <div className={`flex items-center gap-2 mb-1 ${isRight ? 'flex-row-reverse' : ''}`}>
                  <motion.span
                    className="text-5xl leading-none"
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: delay + 0.3 }}
                  >
                    {character.emoji}
                  </motion.span>
                  <span
                    className="text-base font-bold uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    {character.name}
                  </span>
                </div>

                {/* Quote */}
                <motion.p
                  className={`text-2xl font-bold text-white ${isRight ? 'text-right' : 'text-left'}`}
                  style={{ wordBreak: 'keep-all' }}
                  initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: delay + 0.12 }}
                >
                  <span style={{ color: accent, opacity: 0.6 }}>&ldquo;</span>
                  {parseInlineBold(line.text, accent)}
                  <span style={{ color: accent, opacity: 0.6 }}>&rdquo;</span>
                </motion.p>
              </motion.div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/** 3. Action (액션/SFX) — Kinetic Typography */
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
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(circle at center, ${accent}26, #0a0a0a)`,
      }}
    >
      {/* Effect: focus — pulsing radial gradient */}
      {effect === 'focus' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${accent}33, transparent 70%)`,
          }}
          animate={isActive ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Effect: speed — animated diagonal stripes */}
      {effect === 'speed' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent 0px,
              transparent 12px,
              ${accent}15 12px,
              ${accent}15 14px
            )`,
            backgroundSize: '200% 200%',
          }}
          animate={isActive ? { backgroundPosition: ['0% 0%', '100% 100%'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Content with optional shake */}
      <motion.div
        className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-5 py-5"
        animate={
          isActive && effect === 'impact'
            ? { x: [0, -6, 6, -4, 4, -2, 2, 0], scale: [1, 1.02, 0.98, 1] }
            : {}
        }
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        {lines.map((line, i) => {
          const delay = 0.2 + i * 0.15;

          if (line.type === 'narration') {
            return (
              <motion.div
                key={i}
                className="absolute left-4 top-12 z-20"
                initial={{ opacity: 0, x: -15 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    wordBreak: 'keep-all',
                  }}
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
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isActive ? { opacity: 1, scale: [0.3, 1.1, 1] } : {}}
                transition={{ type: 'spring', stiffness: 250, damping: 12, delay }}
              >
                <span
                  className="text-5xl font-black sm:text-6xl"
                  style={{
                    color: '#fff',
                    textShadow: `0 0 40px ${accent}99, 0 0 80px ${accent}44, 0 4px 20px rgba(0,0,0,0.5)`,
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
            return (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -15 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay }}
              >
                <span className="text-2xl">{character.emoji}</span>
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider block"
                    style={{ color: accent }}
                  >
                    {character.name}
                  </span>
                  <p
                    className="text-base text-white/90"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {parseInlineBold(line.text, accent)}
                  </p>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.p
              key={i}
              className="text-center text-base text-white/80"
              style={{ wordBreak: 'keep-all' }}
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

/** 4. Data (데이터) — Kinetic Typography */
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
      style={{ background: 'linear-gradient(180deg, #0a0a14, #0f1a2e)' }}
    >
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 py-5">
        {/* Narration at top */}
        {textLines.map((line, i) => {
          if (line.type === 'narration') {
            return (
              <motion.div
                key={`t-${i}`}
                className="absolute left-4 top-4 z-20"
                initial={{ opacity: 0, x: -15 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    wordBreak: 'keep-all',
                  }}
                >
                  {line.text}
                </span>
              </motion.div>
            );
          }
          return null;
        })}

        {/* Stats */}
        {stats.map((stat, i) => {
          const isMain = i === 0;
          const delay = 0.3 + i * 0.2;

          return (
            <motion.div
              key={`s-${i}`}
              className="flex flex-col items-center"
              style={{
                borderLeft: `2px solid ${accent}`,
                paddingLeft: '16px',
              }}
              initial={{ opacity: 0, scale: isMain ? 0.5 : 0.8 }}
              animate={isActive ? { opacity: 1, scale: 1 } : {}}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 18,
                delay,
              }}
            >
              <span
                className={`font-black ${isMain ? 'text-5xl' : 'text-2xl'}`}
                style={{
                  color: '#fff',
                  textShadow: isMain ? `0 0 30px ${accent}4D` : undefined,
                  wordBreak: 'keep-all',
                }}
              >
                {stat.number}
              </span>
              <span
                className="text-sm mt-1 uppercase tracking-wider"
                style={{ color: accent, wordBreak: 'keep-all' }}
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
              style={{ color: 'rgba(255,255,255,0.6)', wordBreak: 'keep-all' }}
              initial={{ opacity: 0, y: 8 }}
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

/** 5. Versus (비교) — Kinetic Typography */
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
    <div
      className="relative flex h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #0a0a14 0%, #0a0a14 48%, ${accent}1A 52%, ${accent}1A 100%)`,
      }}
    >
      {/* Diagonal divider */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          right: 0,
          width: '141%',
          height: '2px',
          backgroundColor: `${accent}4D`,
          transformOrigin: 'top right',
          transform: 'rotate(45deg)',
        }}
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-5 py-5">
        {/* Header row */}
        {headerLine && (
          <motion.div
            className="flex w-full justify-between px-4"
            initial={{ opacity: 0, y: -12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span
              className="text-lg font-black text-white"
              style={{ wordBreak: 'keep-all' }}
            >
              {headerLine.number}
            </span>
            <span
              className="text-lg font-black"
              style={{ color: accent, wordBreak: 'keep-all' }}
            >
              {headerLine.label}
            </span>
          </motion.div>
        )}

        {/* Data rows */}
        {dataLines.map((line, i) => (
          <motion.div
            key={i}
            className="flex w-full justify-between px-4"
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          >
            <span className="text-sm text-white/80" style={{ wordBreak: 'keep-all' }}>
              {line.number}
            </span>
            <span
              className="text-sm"
              style={{ color: `${accent}CC`, wordBreak: 'keep-all' }}
            >
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
              className="text-center text-xs text-white/50"
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
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: '#0a0a14',
          border: `2px solid ${accent}`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0 }}
        animate={isActive ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.5 }}
      >
        <span className="text-xs font-black" style={{ color: accent }}>
          VS
        </span>
      </motion.div>
    </div>
  );
}

/** 6. Revelation (반전/충격) — Kinetic Typography */
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
      {/* Pulsing radial accent glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${accent}33 0%, transparent 65%)`,
        }}
        animate={isActive ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-5">
        {lines.map((line, i) => {
          const delay = 0.4 + i * 0.15;

          if (line.type === 'divider') {
            return (
              <motion.div
                key={i}
                className="h-px w-16 mx-auto"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                initial={{ scaleX: 0 }}
                animate={isActive ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay }}
              />
            );
          }

          if (line.type === 'sfx' || line.type === 'text') {
            const isMainText = line.type === 'sfx' || lines.filter(l => l.type === 'text').indexOf(line) === 0;
            return (
              <motion.p
                key={i}
                className={`text-center font-black text-white ${isMainText ? 'text-3xl sm:text-4xl' : 'text-base'}`}
                style={{
                  wordBreak: 'keep-all',
                  ...(isMainText
                    ? { textShadow: `0 0 40px ${accent}66` }
                    : { color: 'rgba(255,255,255,0.7)' }),
                }}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isActive ? { opacity: isMainText ? 1 : 0.7, scale: [0.3, 1.05, 1] } : {}}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay,
                }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          if (line.type === 'narration') {
            return (
              <motion.p
                key={i}
                className="text-center text-sm text-white/50"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 0.5 } : {}}
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

/** 7. Montage (몽타주) — Kinetic Typography */
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

  const frameLines: ContentLine[] = [];
  let footerLine: ContentLine | null = null;

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    if (i === contentLines.length - 1 && line.type === 'text' && /\*\*.+\*\*/.test(line.text)) {
      footerLine = line;
    } else {
      frameLines.push(line);
    }
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-0 px-5 py-5">
        {/* Section title with side lines */}
        {sectionTitle && (
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.div
              className="h-px w-8"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              initial={{ scaleX: 0 }}
              animate={isActive ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: accent, wordBreak: 'keep-all' }}
            >
              {sectionTitle.text}
            </span>
            <motion.div
              className="h-px w-8"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              initial={{ scaleX: 0 }}
              animate={isActive ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.div>
        )}

        {/* Timeline with items */}
        <div className="relative flex flex-col items-center gap-0 w-full">
          {/* Vertical dashed timeline */}
          {frameLines.length > 1 && (
            <div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none"
              style={{
                borderLeft: `1px dashed ${accent}33`,
              }}
            />
          )}

          {frameLines.map((line, i) => {
            const fromLeft = i % 2 === 0;
            return (
              <motion.div
                key={i}
                className="relative z-10 my-2 w-full"
                initial={{ opacity: 0, x: fromLeft ? -30 : 30 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
              >
                <p
                  className={`text-sm text-white/80 ${fromLeft ? 'text-left pl-4' : 'text-right pr-4'}`}
                  style={{ wordBreak: 'keep-all' }}
                >
                  {parseInlineBold(line.text, accent)}
                </p>
                <motion.div
                  className={`mt-1 h-px ${fromLeft ? 'mr-auto ml-4' : 'ml-auto mr-4'}`}
                  style={{
                    backgroundColor: `${accent}4D`,
                    width: '40%',
                    transformOrigin: fromLeft ? 'left' : 'right',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={isActive ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.15 }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Footer bold text */}
        {footerLine && (
          <motion.p
            className="mt-4 text-center text-lg font-black text-white"
            style={{ wordBreak: 'keep-all' }}
            initial={{ opacity: 0, y: 15 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 + frameLines.length * 0.15 }}
          >
            {parseInlineBold(footerLine.text, accent)}
          </motion.p>
        )}
      </div>
    </div>
  );
}

/** 8. Closeup (클로즈업) — Kinetic Typography */
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
  const dialogueLine = lines.find(l => l.type === 'dialogue');
  const character = dialogueLine?.characterId ? findChar(dialogueLine.characterId) : null;
  const emoji = character?.emoji || '\uD83D\uDCAC';

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(180deg, #0a0a14, ${accent}14)`,
      }}
    >
      {/* Huge emoji watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isActive ? { scale: 1, opacity: 0.08 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
      >
        <span className="text-9xl">{emoji}</span>
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-5">
        {lines.map((line, i) => {
          const delay = 0.5 + i * 0.15;

          if (line.type === 'dialogue' && line.characterId) {
            return (
              <motion.p
                key={i}
                className="text-center text-2xl font-black text-white"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0, scale: 0.8, rotate: -1 }}
                animate={isActive ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay }}
              >
                {parseInlineBold(line.text, accent)}
              </motion.p>
            );
          }

          if (line.type === 'narration') {
            return (
              <motion.span
                key={i}
                className="text-xs italic"
                style={{ color: accent, wordBreak: 'keep-all' }}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 0.8 } : {}}
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
                className="text-center text-2xl font-black text-white"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0, scale: 0.8, rotate: -1 }}
                animate={isActive ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay }}
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
