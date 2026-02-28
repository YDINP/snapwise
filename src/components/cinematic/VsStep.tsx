'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

/** Highlight numbers/percentages in footer text with accent color */
function renderFooterWithHighlight(text: string, accent: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim());

  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    const parts: React.ReactNode[] = [];
    const numRegex = /(\d[\d,.]*\s*(?:%p|%|배|만|억|원|명|개|km|kg|초|분|시간|x|×)?)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = numRegex.exec(trimmed)) !== null) {
      if (match.index > lastIdx) {
        parts.push(trimmed.slice(lastIdx, match.index));
      }
      parts.push(
        <span key={`n-${lineIdx}-${match.index}`} className="font-black" style={{ color: accent }}>
          {match[1]}
        </span>
      );
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < trimmed.length) {
      parts.push(trimmed.slice(lastIdx));
    }

    return (
      <React.Fragment key={lineIdx}>
        {parts.length > 0 ? parts : trimmed}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

interface VsStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/**
 * Parsed result for VS comparison:
 * - leftTitle / rightTitle: labels shown above each panel (bold colored header)
 * - leftBody / rightBody:   main descriptive content of each panel
 * - footer:                 extra lines after the comparison (stats, notes, etc.)
 */
interface VsParsed {
  leftTitle: string;
  rightTitle: string;
  leftBody: string;
  rightBody: string;
  footer: string[];
}

/** Strip horizontal rule markers (───, ---, ===) from a line */
function isHorizontalRule(line: string): boolean {
  return /^[─\-=]{3,}$/.test(line.trim());
}

/**
 * Parse vs step content into a unified VsParsed structure.
 *
 * Supported formats (all rendered with the same stacked vertical layout):
 *
 * Format A — Standalone pipe separator (one or more lines above and below `|`):
 *   Left block text (one or multiple lines)
 *   |
 *   Right block text (one or multiple lines)
 *   Optional footer (detected when right side has one extra line vs left)
 *
 * Format B — Inline pipe table (first row is header, subsequent rows are data):
 *   LeftTitle | RightTitle
 *   left data | right data
 *   left data | right data
 *   Optional footer lines (no `|`)
 *
 * All formats produce:
 *   leftTitle, rightTitle → panel labels (bold, colored header of each panel)
 *   leftBody, rightBody  → multi-line content inside each panel
 *   footer               → trailing notes / stats shown below the comparison
 */
function parseVsContent(content: string): VsParsed {
  // Normalize: trim each line, remove horizontal rules
  const rawLines = content.split('\n').map(l => l.trim()).filter(l => !isHorizontalRule(l));
  const lines = rawLines.filter(Boolean);

  // ─── Format A: Standalone pipe (at least one `|` on its own line) ───
  const standalonePipeIdx = lines.findIndex(l => l === '|');
  if (standalonePipeIdx !== -1) {
    const leftLines = lines.slice(0, standalonePipeIdx);
    const afterPipe = lines.slice(standalonePipeIdx + 1);

    // Check for a second standalone `|`
    const secondPipeOffset = afterPipe.findIndex(l => l === '|');

    let rightLines: string[];
    let footerLines: string[];
    if (secondPipeOffset !== -1) {
      rightLines = afterPipe.slice(0, secondPipeOffset);
      footerLines = afterPipe.slice(secondPipeOffset + 1);
    } else {
      rightLines = afterPipe;
      footerLines = [];
    }

    // If right block has exactly one more line than left block, the extra trailing
    // line is likely a summary/footer sentence rather than comparison data.
    if (rightLines.length > leftLines.length && rightLines.length - leftLines.length === 1) {
      footerLines = [rightLines[rightLines.length - 1], ...footerLines];
      rightLines = rightLines.slice(0, -1);
    }

    const leftTitle = leftLines[0] ?? '';
    const leftBody = leftLines.slice(1).join('\n').trim();
    const rightTitle = rightLines[0] ?? '';
    const rightBody = rightLines.slice(1).join('\n').trim();

    return { leftTitle, rightTitle, leftBody, rightBody, footer: footerLines };
  }

  // ─── Format B: Inline pipe rows ───
  // Separate piped rows from non-piped (footer) lines
  const pipedRows: Array<{ left: string; right: string }> = [];
  const footerLines: string[] = [];

  for (const line of lines) {
    const pipeIdx = line.indexOf('|');
    if (pipeIdx !== -1) {
      pipedRows.push({
        left: line.slice(0, pipeIdx).trim(),
        right: line.slice(pipeIdx + 1).trim(),
      });
    } else {
      footerLines.push(line);
    }
  }

  if (pipedRows.length === 0) {
    // Fallback: no pipes at all — treat full content as left panel
    return {
      leftTitle: '',
      rightTitle: '',
      leftBody: lines.join('\n'),
      rightBody: '',
      footer: [],
    };
  }

  if (pipedRows.length === 1) {
    // Single piped row → treat as panel titles, no body
    return {
      leftTitle: pipedRows[0].left,
      rightTitle: pipedRows[0].right,
      leftBody: '',
      rightBody: '',
      footer: footerLines,
    };
  }

  // Multiple rows: first row is the title/header row, rest are body data
  const [header, ...dataRows] = pipedRows;
  return {
    leftTitle: header.left,
    rightTitle: header.right,
    leftBody: dataRows.map(r => r.left).join('\n'),
    rightBody: dataRows.map(r => r.right).join('\n'),
    footer: footerLines,
  };
}

export default function VsStep({ step, card, isActive }: VsStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { leftTitle, rightTitle, leftBody, rightBody, footer } = parseVsContent(step.content);

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

      {/* Main comparison area — always stacked vertical layout */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="flex w-full flex-col items-center gap-0">

          {/* ── Top panel (left / A side) ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full rounded-t-2xl border border-b-0 border-blue-500/20 bg-blue-950/20 px-5 py-4 backdrop-blur-sm"
          >
            {leftTitle && (
              <p
                className="mb-2 text-sm font-black text-blue-300"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {leftTitle}
              </p>
            )}
            {leftBody && (
              <p
                className="text-sm leading-relaxed text-white/80"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {renderWithLineBreaks(leftBody)}
              </p>
            )}
          </motion.div>

          {/* ── VS divider ── */}
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

          {/* ── Bottom panel (right / B side) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="w-full rounded-b-2xl border border-t-0 px-5 py-4 backdrop-blur-sm"
            style={{
              borderColor: `${categoryInfo.accent}30`,
              backgroundColor: `${categoryInfo.accent}08`,
            }}
          >
            {rightTitle && (
              <p
                className="mb-2 text-sm font-black"
                style={{ color: categoryInfo.accent, wordBreak: 'keep-all' }}
              >
                {rightTitle}
              </p>
            )}
            {rightBody && (
              <p
                className="text-sm leading-relaxed text-white/80"
                style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
              >
                {renderWithLineBreaks(rightBody)}
              </p>
            )}
          </motion.div>
        </div>

        {/* ── Footer text (stats / notes) ── */}
        {footer.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-5 w-full border-t border-white/10 pt-4"
          >
            <p
              className="text-center text-xs leading-relaxed text-white/50 sm:text-sm"
              style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
            >
              {renderFooterWithHighlight(footer.join('\n'), categoryInfo.accent)}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
