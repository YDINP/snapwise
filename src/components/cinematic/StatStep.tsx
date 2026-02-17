'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface StatStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface StatItem {
  value: string;
  label: string;
}

interface ParsedStat {
  mode: 'multi' | 'single';
  items: StatItem[];      // for multi mode
  bigStat: string;        // for single mode
  description: string;   // context text (below stats in both modes)
}

/**
 * Detect which side of a pipe-separated pair contains the numeric/stat value.
 * Returns { value, label } with the stat on the value side.
 */
function splitPipeLine(line: string): StatItem {
  const [left, right] = line.split('|').map(s => s.trim());
  // A "stat" token contains digits, %, ×, 배, 명, 원, +, ~
  const statPattern = /[\d%×배명원+~]/;
  const leftIsStat = statPattern.test(left);
  if (leftIsStat) {
    return { value: left, label: right ?? '' };
  }
  return { value: right ?? '', label: left };
}

/**
 * Detect whether a line looks like a standalone big stat (no pipe).
 * Matches: digits, %, ×, 배, 명, 원, 개, 초, km, kg, etc.
 */
function looksLikeStat(line: string): boolean {
  return /^[\d\s%×배명원개초km㎞kg,.\-+~x]+$/.test(line.trim()) ||
    /^\d/.test(line.trim()) ||
    /[%배명원개×]/.test(line.trim());
}

function parseStatContent(content: string): ParsedStat {
  const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);

  const pipeLines: string[] = [];
  const plainLines: string[] = [];

  for (const line of rawLines) {
    if (line.includes('|')) {
      pipeLines.push(line);
    } else {
      plainLines.push(line);
    }
  }

  // Format A: at least one pipe line → multi mode
  if (pipeLines.length > 0) {
    const items = pipeLines.map(splitPipeLine);
    const description = plainLines.join('\n');
    return { mode: 'multi', items, bigStat: '', description };
  }

  // Format B: no pipes — first line is the big stat if it looks numeric
  if (rawLines.length > 0 && looksLikeStat(rawLines[0])) {
    const bigStat = rawLines[0];
    const description = rawLines.slice(1).join('\n');
    return { mode: 'single', items: [], bigStat, description };
  }

  // Fallback: treat everything as a single stat block
  const bigStat = rawLines[0] ?? '';
  const description = rawLines.slice(1).join('\n');
  return { mode: 'single', items: [], bigStat, description };
}

export default function StatStep({ step, card, isActive }: StatStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const parsed = parseStatContent(step.content);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Pure black base */}
      <div className="absolute inset-0 bg-black" />

      {/* Radial glow centered behind numbers */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${categoryInfo.accent}1A` }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 px-6">
        {parsed.mode === 'single' ? (
          <SingleStat
            bigStat={parsed.bigStat}
            description={parsed.description}
            accent={categoryInfo.accent}
            isActive={isActive}
          />
        ) : (
          <MultiStats
            items={parsed.items}
            description={parsed.description}
            accent={categoryInfo.accent}
            isActive={isActive}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single big stat layout                                              */
/* ------------------------------------------------------------------ */

interface SingleStatProps {
  bigStat: string;
  description: string;
  accent: string;
  isActive: boolean;
}

function SingleStat({ bigStat, description, accent, isActive }: SingleStatProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Accent top rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="h-0.5 w-10 origin-center"
        style={{ backgroundColor: accent }}
      />

      {/* Big number */}
      <motion.p
        initial={{ opacity: 0, scale: 0.7 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 160, damping: 14 }}
        className="text-center text-6xl font-black leading-none tracking-tight"
        style={{ color: accent, wordBreak: 'keep-all' }}
      >
        {bigStat}
      </motion.p>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-center text-base font-medium leading-snug text-white/70"
          style={{ wordBreak: 'keep-all' }}
        >
          {description}
        </motion.p>
      )}

      {/* Accent bottom rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="h-0.5 w-10 origin-center"
        style={{ backgroundColor: accent }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multiple stats layout (glass cards)                                 */
/* ------------------------------------------------------------------ */

interface MultiStatsProps {
  items: StatItem[];
  description: string;
  accent: string;
  isActive: boolean;
}

function getValueSize(value: string): string {
  const len = value.length;
  if (len <= 8) return 'text-2xl';
  if (len <= 15) return 'text-xl';
  return 'text-base';
}

function MultiStats({ items, description, accent, isActive }: MultiStatsProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Stat glass cards — stagger in, vertical layout */}
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: 'easeOut' }}
          className="flex w-full flex-col gap-1.5 rounded-2xl border border-white/10 px-5 py-3.5 backdrop-blur-md"
          style={{
            boxShadow: `0 0 24px ${accent}12, inset 0 1px 0 rgba(255,255,255,0.08)`,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {/* Label on top */}
          <p
            className="text-xs font-medium leading-snug text-white/50"
            style={{ wordBreak: 'keep-all' }}
          >
            {item.label}
          </p>

          {/* Value below — adaptive font size */}
          <p
            className={`${getValueSize(item.value)} font-black leading-tight tracking-tight`}
            style={{ color: accent, wordBreak: 'keep-all' }}
          >
            {item.value}
          </p>
        </motion.div>
      ))}

      {/* Context description below all cards */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 + items.length * 0.12 + 0.1 }}
          className="mt-1 text-center text-sm font-medium leading-snug text-white/50"
          style={{ wordBreak: 'keep-all' }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
