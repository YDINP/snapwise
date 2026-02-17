'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

interface VsStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface VsParsed {
  leftTitle: string;
  rightTitle: string;
  rows: Array<{ left: string; right: string }>;
  footer: string[];
}

/**
 * Detect if content uses standalone `|` separator (on its own line).
 * Format:  left block text \n | \n right block text
 */
function isStandalonePipeFormat(lines: string[]): boolean {
  return lines.some(l => l === '|');
}

/**
 * Extract a short title from a block of text.
 * Uses text before first `:` or `—`, or first line if short enough.
 */
function extractTitle(block: string): { title: string; body: string } {
  const firstLine = block.split('\n')[0].trim();

  // Try splitting at colon or em-dash
  for (const sep of [':', '—']) {
    const idx = firstLine.indexOf(sep);
    if (idx > 0 && idx <= 30) {
      return {
        title: firstLine.slice(0, idx).trim(),
        body: (firstLine.slice(idx + 1).trim() + '\n' + block.split('\n').slice(1).join('\n')).trim(),
      };
    }
  }

  // If first line is short enough, use it as title
  if (firstLine.length <= 20) {
    return { title: firstLine, body: block.split('\n').slice(1).join('\n').trim() };
  }

  return { title: '', body: block };
}

/**
 * Parse the MDX-style content string.
 *
 * Supports three formats:
 * 1. Standalone `|` separator: two blocks separated by `|` on its own line
 * 2. Inline pipe: `left|right` rows with first row as header
 * 3. Multi-line table: header row + data rows with inline pipes
 */
function parseVsContent(content: string): VsParsed {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  // ─── Format 1: Standalone pipe separator ───
  if (isStandalonePipeFormat(lines)) {
    const pipeIdx = lines.indexOf('|');
    const leftBlock = lines.slice(0, pipeIdx).join('\n').trim();
    const rightBlock = lines.slice(pipeIdx + 1).join('\n').trim();

    const left = extractTitle(leftBlock);
    const right = extractTitle(rightBlock);

    return {
      leftTitle: left.title,
      rightTitle: right.title,
      rows: [{ left: left.body || leftBlock, right: right.body || rightBlock }],
      footer: [],
    };
  }

  // ─── Format 2 & 3: Inline pipe rows ───
  let leftTitle = '';
  let rightTitle = '';
  const rows: Array<{ left: string; right: string }> = [];
  const footer: string[] = [];

  let headerFound = false;

  for (const line of lines) {
    if (line.includes('|')) {
      const pipeIndex = line.indexOf('|');
      const left = line.slice(0, pipeIndex).trim();
      const right = line.slice(pipeIndex + 1).trim();

      if (!headerFound) {
        leftTitle = left;
        rightTitle = right;
        headerFound = true;
      } else {
        rows.push({ left, right });
      }
    } else {
      footer.push(line);
    }
  }

  return { leftTitle, rightTitle, rows, footer };
}

export default function VsStep({ step, card, isActive }: VsStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { leftTitle, rightTitle, rows, footer } = parseVsContent(step.content);

  // Use stacked layout when rows have long text (standalone format)
  const isStacked = rows.length === 1 && (rows[0].left.length > 25 || rows[0].right.length > 25);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Dark base background */}
      <div className="absolute inset-0 bg-zinc-950" />

      {/* Subtle top glow (blue tint) */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(59,130,246,0.06) 0%, transparent 100%)',
        }}
      />

      {/* Subtle bottom glow (accent tint) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${categoryInfo.accent}0C 0%, transparent 100%)`,
        }}
      />

      {/* Main comparison area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6">

        {isStacked ? (
          /* ─── Stacked vertical layout (for standalone pipe format) ─── */
          <div className="flex w-full flex-col items-center gap-0">
            {/* Top panel (left/A side) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full rounded-t-2xl border border-b-0 border-blue-500/20 bg-blue-950/20 px-5 py-4 backdrop-blur-sm"
            >
              {leftTitle && (
                <p className="mb-2 text-sm font-black text-blue-300" style={{ wordBreak: 'keep-all', textWrap: 'balance' }}>
                  {leftTitle}
                </p>
              )}
              <p
                className="text-sm leading-relaxed text-white/80"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {renderWithLineBreaks(rows[0].left)}
              </p>
            </motion.div>

            {/* VS divider between panels */}
            <div className="relative z-10 flex w-full items-center">
              <div className="flex-1 border-t border-white/10" />
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isActive ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.25, type: 'spring', stiffness: 280, damping: 18 }}
                className="mx-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-zinc-900"
                style={{ borderColor: categoryInfo.accent }}
              >
                <span className="text-xs font-black tracking-tighter" style={{ color: categoryInfo.accent }}>
                  VS
                </span>
              </motion.div>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Bottom panel (right/B side) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="w-full rounded-b-2xl border border-t-0 bg-zinc-900/40 px-5 py-4 backdrop-blur-sm"
              style={{
                borderColor: `${categoryInfo.accent}30`,
                backgroundColor: `${categoryInfo.accent}08`,
              }}
            >
              {rightTitle && (
                <p className="mb-2 text-sm font-black" style={{ color: categoryInfo.accent, wordBreak: 'keep-all' }}>
                  {rightTitle}
                </p>
              )}
              <p
                className="text-sm leading-relaxed text-white/80"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {renderWithLineBreaks(rows[0].right)}
              </p>
            </motion.div>
          </div>
        ) : (
          /* ─── Side-by-side layout (for inline pipe format) ─── */
          <>
            {/* Header row: left title | VS badge | right title */}
            <div className="flex w-full items-center gap-2 mb-4">
              <motion.div
                initial={{ opacity: 0, x: -32 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="flex-1 flex justify-center"
              >
                <h2
                  className="text-center text-sm font-black leading-tight text-blue-300 sm:text-base"
                  style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
                >
                  {leftTitle}
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isActive ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.25, type: 'spring', stiffness: 280, damping: 18 }}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-zinc-900"
                style={{ borderColor: categoryInfo.accent }}
              >
                <span className="text-xs font-black tracking-tighter" style={{ color: categoryInfo.accent }}>
                  VS
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="flex-1 flex justify-center"
              >
                <h2
                  className="text-center text-sm font-black leading-tight sm:text-base"
                  style={{ color: categoryInfo.accent, wordBreak: 'keep-all' }}
                >
                  {rightTitle}
                </h2>
              </motion.div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isActive ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-4 h-px w-full origin-center bg-white/10"
            />

            {/* Content rows */}
            <div className="flex w-full flex-col gap-3">
              {rows.map((row, i) => (
                <div key={i} className="flex w-full items-stretch gap-2">
                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={isActive ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                    className="flex-1 rounded-xl border border-blue-500/20 bg-blue-950/30 px-3 py-3 backdrop-blur-sm"
                  >
                    <p
                      className="text-center text-xs leading-snug text-white/85 sm:text-sm"
                      style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
                    >
                      {renderWithLineBreaks(row.left)}
                    </p>
                  </motion.div>

                  <div className="flex w-9 shrink-0 items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={isActive ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                    className="flex-1 rounded-xl border bg-zinc-900/60 px-3 py-3 backdrop-blur-sm"
                    style={{
                      borderColor: `${categoryInfo.accent}30`,
                      backgroundColor: `${categoryInfo.accent}0A`,
                    }}
                  >
                    <p
                      className="text-center text-xs leading-snug text-white/85 sm:text-sm"
                      style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
                    >
                      {renderWithLineBreaks(row.right)}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer text */}
        {footer.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45 + rows.length * 0.1 }}
            className="mt-5 w-full border-t border-white/10 pt-4"
          >
            <p
              className="text-center text-xs leading-relaxed text-white/50 sm:text-sm"
              style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
            >
              {renderWithLineBreaks(footer.join('\n'))}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
