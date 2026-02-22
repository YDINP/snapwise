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

// ─── Utility Components ──────────────────────────────────────────────────────

function renderInlineMarkdown(str: string): React.ReactNode[] {
  // Parse **bold** markers into <strong> elements
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[var(--accent)]">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function TypeWriter({ text, isActive, delay = 0, speed = 30, className, style }: {
  text: string; isActive: boolean; delay?: number; speed?: number; className?: string; style?: React.CSSProperties;
}) {
  // Strip markdown markers for length calculation, type visible chars only
  const plainText = text.replace(/\*\*/g, '');
  const [charIndex, setCharIndex] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!isActive) { setCharIndex(0); setStarted(false); return; }
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [isActive, delay]);

  React.useEffect(() => {
    if (!started) return;
    if (charIndex >= plainText.length) return;
    const timer = setTimeout(() => setCharIndex(prev => prev + 1), speed);
    return () => clearTimeout(timer);
  }, [started, charIndex, plainText.length, speed]);

  // Map charIndex back to original text position to get partial string with intact markdown
  const visibleText = React.useMemo(() => {
    let plain = 0;
    let raw = 0;
    while (plain < charIndex && raw < text.length) {
      if (text[raw] === '*' && text[raw + 1] === '*') {
        raw += 2; // skip opening/closing **
      } else {
        plain++;
        raw++;
      }
    }
    // Include any trailing ** to close bold properly
    let slice = text.slice(0, raw);
    // Count unmatched ** pairs and close them
    const markers = (slice.match(/\*\*/g) || []).length;
    if (markers % 2 !== 0) slice += '**';
    return slice;
  }, [charIndex, text]);

  const done = charIndex >= plainText.length;

  return <span className={className} style={style}>{renderInlineMarkdown(visibleText)}{done ? '' : <span className="animate-pulse">|</span>}</span>;
}

function CountUp({ target, isActive, delay = 0, duration = 1200, className, style }: {
  target: string; isActive: boolean; delay?: number; duration?: number; className?: string; style?: React.CSSProperties;
}) {
  const [value, setValue] = React.useState('0');

  React.useEffect(() => {
    if (!isActive) { setValue('0'); return; }
    const numMatch = target.match(/^([\d,]+)/);
    if (!numMatch) { setValue(target); return; }
    const numStr = numMatch[1].replace(/,/g, '');
    const num = parseInt(numStr);
    if (isNaN(num)) { setValue(target); return; }
    const suffix = target.slice(numMatch[0].length);
    const startTime = Date.now() + delay * 1000;

    let rafId: number;
    const animate = () => {
      const now = Date.now();
      if (now < startTime) { rafId = requestAnimationFrame(animate); return; }
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(num * eased);
      const formatted = numMatch[0].includes(',') ? current.toLocaleString() : String(current);
      setValue(formatted + suffix);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isActive, target, delay, duration]);

  return <span className={className} style={style}>{value}</span>;
}

function TextScramble({ text, isActive, delay = 0, className, style }: {
  text: string; isActive: boolean; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const scrambleChars = '!@#$%^&_+-=:,.<>?/~';
  const plainText = text.replace(/\*\*/g, '');
  const [displayed, setDisplayed] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!isActive) { setDisplayed(''); setStarted(false); setDone(false); return; }
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [isActive, delay]);

  React.useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = plainText.length * 3;
    const interval = setInterval(() => {
      frame++;
      const resolved = Math.floor((frame / totalFrames) * plainText.length);
      let result = '';
      for (let i = 0; i < plainText.length; i++) {
        if (plainText[i] === ' ') { result += ' '; continue; }
        if (i < resolved) { result += plainText[i]; }
        else { result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)]; }
      }
      setDisplayed(result);
      if (frame >= totalFrames) { setDone(true); clearInterval(interval); }
    }, 30);
    return () => clearInterval(interval);
  }, [started, plainText, scrambleChars]);

  if (done) return <span className={className} style={style}>{renderInlineMarkdown(text)}</span>;
  return <span className={className} style={style}>{displayed || plainText.split('').map(() => '\u00A0').join('')}</span>;
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
  const textLines = lines.filter(l => l.type === 'text');
  const firstTextIndex = lines.findIndex(l => l.type === 'text');

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
                <motion.span
                  className="text-4xl font-black"
                  style={{
                    color: accent,
                    textShadow: `0 0 30px ${accent}80, 0 0 60px ${accent}40`,
                    wordBreak: 'keep-all',
                  }}
                  animate={isActive ? { textShadow: [
                    `0 0 30px ${accent}80, 0 0 60px ${accent}40`,
                    `0 0 50px ${accent}CC, 0 0 90px ${accent}66`,
                    `0 0 30px ${accent}80, 0 0 60px ${accent}40`,
                  ] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {line.text}
                </motion.span>
              </motion.div>
            );
          }

          // First text line: TypeWriter, rest: fade-in
          if (line.type === 'text' && i === firstTextIndex) {
            return (
              <motion.p
                key={i}
                className="text-center text-xl leading-relaxed my-1 text-white"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay }}
              >
                <TypeWriter text={line.text} isActive={isActive} delay={delay} speed={30} />
              </motion.p>
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
                    initial={{ scale: 0, rotate: -15 }}
                    animate={isActive ? { scale: 1, rotate: 0 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 12, delay: delay + 0.1 }}
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

                {/* Quote with TypeWriter */}
                <motion.div
                  className={`text-2xl font-bold text-white ${isRight ? 'text-right' : 'text-left'}`}
                  style={{ wordBreak: 'keep-all' }}
                  initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: delay + 0.12 }}
                >
                  <span style={{ color: accent, opacity: 0.6 }}>&ldquo;</span>
                  <TypeWriter text={line.text} isActive={isActive} delay={delay + 0.25} speed={25} />
                  <span style={{ color: accent, opacity: 0.6 }}>&rdquo;</span>
                </motion.div>
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
  const sfxLines = lines.filter(l => l.type === 'sfx');
  const firstSfxIndex = lines.findIndex(l => l.type === 'sfx');

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
            // First SFX: TextScramble effect, rest: spring
            if (i === firstSfxIndex) {
              return (
                <motion.div
                  key={i}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={isActive ? { opacity: 1, scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 250, damping: 12, delay }}
                >
                  <TextScramble
                    text={line.text}
                    isActive={isActive}
                    delay={delay}
                    className="text-5xl font-black sm:text-6xl"
                    style={{
                      color: '#fff',
                      textShadow: `0 0 40px ${accent}99, 0 0 80px ${accent}44, 0 4px 20px rgba(0,0,0,0.5)`,
                      wordBreak: 'keep-all',
                    }}
                  />
                </motion.div>
              );
            }
            return (
              <motion.div
                key={i}
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isActive ? { opacity: 1, scale: 1 } : {}}
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
                  <TypeWriter
                    text={line.text}
                    isActive={isActive}
                    delay={delay + 0.15}
                    speed={25}
                    className="text-base text-white/90"
                    style={{ wordBreak: 'keep-all' }}
                  />
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

        {/* Stats with CountUp */}
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
              <CountUp
                target={stat.number || '0'}
                isActive={isActive}
                delay={delay + 0.2}
                duration={isMain ? 1500 : 1000}
                className={`font-black ${isMain ? 'text-5xl' : 'text-2xl'}`}
                style={{
                  color: '#fff',
                  textShadow: isMain ? `0 0 30px ${accent}4D` : undefined,
                  wordBreak: 'keep-all',
                }}
              />
              <motion.span
                className="text-sm mt-1 uppercase tracking-wider"
                style={{ color: accent, wordBreak: 'keep-all' }}
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: delay + 0.6 }}
              >
                {stat.label}
              </motion.span>
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

/** 5. Versus (비교) — Animated Card Comparison */
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
  const textLines = lines.filter(l => l.type === 'text' || l.type === 'narration');

  return (
    <div className="relative flex h-full w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #08081a, #0d1525)' }}>

      {/* Animated scan line */}
      <motion.div className="absolute left-0 right-0 h-px pointer-events-none z-30"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        initial={{ top: 0, opacity: 0 }}
        animate={isActive ? { top: ['0%', '100%'], opacity: [0, 0.6, 0] } : {}}
        transition={{ duration: 2, delay: 0.2, ease: 'linear' }}
      />

      <div className="relative z-10 flex h-full w-full flex-col justify-center px-4 py-5 gap-2">
        {/* Header */}
        {headerLine && (
          <div className="flex w-full mb-3">
            <motion.div className="flex-1 text-center"
              initial={{ opacity: 0, x: -30 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}>
              <span className="text-base font-black text-white" style={{ wordBreak: 'keep-all' }}>
                {headerLine.number}
              </span>
            </motion.div>
            <div className="w-px mx-2" style={{ backgroundColor: `${accent}66` }} />
            <motion.div className="flex-1 text-center"
              initial={{ opacity: 0, x: 30 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}>
              <span className="text-base font-black" style={{ color: accent, wordBreak: 'keep-all' }}>
                {headerLine.label}
              </span>
            </motion.div>
          </div>
        )}

        {/* Animated center divider */}
        <motion.div className="absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2"
          style={{ background: `linear-gradient(180deg, transparent, ${accent}66, transparent)` }}
          initial={{ scaleY: 0 }}
          animate={isActive ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Data rows */}
        {dataLines.map((line, i) => (
          <div key={i} className="flex w-full">
            <motion.div className="flex-1 text-center py-2"
              initial={{ opacity: 0, x: -20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}>
              <TypeWriter text={line.number || ''} isActive={isActive} delay={0.6 + i * 0.15} speed={40}
                className="text-sm text-white/80" style={{ wordBreak: 'keep-all' }} />
            </motion.div>
            <div className="w-px mx-2 opacity-20" style={{ backgroundColor: accent }} />
            <motion.div className="flex-1 text-center py-2"
              initial={{ opacity: 0, x: 20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}>
              <TypeWriter text={line.label || ''} isActive={isActive} delay={0.6 + i * 0.15} speed={40}
                className="text-sm" style={{ color: `${accent}CC`, wordBreak: 'keep-all' }} />
            </motion.div>
          </div>
        ))}

        {/* Row separator glow for each data row */}
        {dataLines.map((_, i) => (
          <motion.div key={`sep-${i}`} className="absolute left-[10%] right-[10%] h-px"
            style={{
              top: `${30 + (i + 1) * (50 / (dataLines.length + 1))}%`,
              background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`
            }}
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
          />
        ))}

        {/* Footer text */}
        {textLines.map((line, i) => (
          <motion.p key={`vt-${i}`} className="text-center text-xs text-white/50 mt-2"
            style={{ wordBreak: 'keep-all' }}
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.8 }}>
            {line.type === 'narration' ? line.text : parseInlineBold(line.text, accent)}
          </motion.p>
        ))}
      </div>
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
  const firstBigIndex = lines.findIndex(l => l.type === 'sfx' || l.type === 'text');

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Pulsing radial accent glow — intensifies */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${accent}33 0%, transparent 65%)`,
        }}
        animate={isActive ? { opacity: [0.4, 1, 0.4] } : { opacity: 0 }}
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

            // First big text: TextScramble, rest: spring
            if (i === firstBigIndex) {
              return (
                <motion.div
                  key={i}
                  className={`text-center font-black text-white ${isMainText ? 'text-3xl sm:text-4xl' : 'text-base'}`}
                  style={{
                    wordBreak: 'keep-all',
                    ...(isMainText ? { textShadow: `0 0 40px ${accent}66` } : { color: 'rgba(255,255,255,0.7)' }),
                  }}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={isActive ? { opacity: isMainText ? 1 : 0.7, scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay }}
                >
                  <TextScramble text={line.text} isActive={isActive} delay={delay} />
                </motion.div>
              );
            }

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
                animate={isActive ? { opacity: isMainText ? 1 : 0.7, scale: 1 } : {}}
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
        {/* Section title with TypeWriter */}
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
            <TypeWriter
              text={sectionTitle.text}
              isActive={isActive}
              delay={0.2}
              speed={40}
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: accent, wordBreak: 'keep-all' }}
            />
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
            const itemDelay = 0.2 + i * 0.15;
            return (
              <motion.div
                key={i}
                className="relative z-10 my-2 w-full"
                initial={{ opacity: 0, x: fromLeft ? -30 : 30 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: itemDelay, ease: 'easeOut' }}
              >
                <div
                  className={`text-sm text-white/80 ${fromLeft ? 'text-left pl-4' : 'text-right pr-4'}`}
                  style={{ wordBreak: 'keep-all' }}
                >
                  <TypeWriter
                    text={line.text}
                    isActive={isActive}
                    delay={itemDelay + 0.1}
                    speed={25}
                  />
                </div>
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
              <motion.div
                key={i}
                className="text-center text-2xl font-black text-white"
                style={{ wordBreak: 'keep-all' }}
                initial={{ opacity: 0, scale: 0.8, rotate: -1 }}
                animate={isActive ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay }}
              >
                <TypeWriter text={line.text} isActive={isActive} delay={delay + 0.1} speed={35} />
              </motion.div>
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
