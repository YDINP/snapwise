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
 * Parse the MDX-style content string:
 *   왼쪽제목|오른쪽제목        <- first pipe line = header titles
 *   왼쪽내용|오른쪽내용        <- subsequent pipe lines = content rows
 *   하단 설명 텍스트           <- lines without pipe = footer
 */
function parseVsContent(content: string): VsParsed {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

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

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Dark base background */}
      <div className="absolute inset-0 bg-zinc-950" />

      {/* Subtle left glow (cool blue tint) */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(59,130,246,0.08) 0%, transparent 100%)',
        }}
      />

      {/* Subtle right glow (category accent tint) */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${categoryInfo.accent}12 0%, transparent 100%)`,
        }}
      />

      {/* Main comparison area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-6 pb-4">

        {/* Header row: left title | VS badge | right title */}
        <div className="flex w-full items-center gap-2 mb-4">
          {/* Left title */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="flex-1 flex justify-center"
          >
            <h2
              className="text-center text-sm font-black leading-tight text-blue-300 sm:text-base"
              style={{ wordBreak: 'keep-all' }}
            >
              {leftTitle}
            </h2>
          </motion.div>

          {/* VS badge (center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.25, type: 'spring', stiffness: 280, damping: 18 }}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-zinc-900"
            style={{ borderColor: categoryInfo.accent }}
          >
            <span
              className="text-xs font-black tracking-tighter"
              style={{ color: categoryInfo.accent }}
            >
              VS
            </span>
          </motion.div>

          {/* Right title */}
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

        {/* Divider line under header */}
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
              {/* Left cell */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                className="flex-1 rounded-xl border border-blue-500/20 bg-blue-950/30 px-3 py-3 backdrop-blur-sm"
              >
                <p
                  className="text-center text-xs leading-snug text-white/85 sm:text-sm"
                  style={{ wordBreak: 'keep-all' }}
                >
                  {renderWithLineBreaks(row.left)}
                </p>
              </motion.div>

              {/* Center separator dot */}
              <div className="flex w-9 shrink-0 items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </div>

              {/* Right cell */}
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
                  style={{ wordBreak: 'keep-all' }}
                >
                  {renderWithLineBreaks(row.right)}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

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
              style={{ wordBreak: 'keep-all' }}
            >
              {renderWithLineBreaks(footer.join('\n'))}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
