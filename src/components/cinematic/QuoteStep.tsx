'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface QuoteStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

/**
 * Parse quote content into { quoteText, attribution }.
 *
 * MDX format examples:
 *   "인용문 텍스트"
 *   — 화자 이름, 직함
 *
 *   상상력은 지식보다 중요하다.
 *   지식에는 한계가 있으니까.
 *   — 알베르트 아인슈타인
 *
 * Lines starting with — or ― are attribution.
 * Everything else (stripped of wrapping " " or " ") is quote text.
 */
function parseQuoteContent(content: string): { quoteText: string; attribution: string | null } {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  const attributionLines: string[] = [];
  const quoteLines: string[] = [];

  for (const line of lines) {
    if (/^[—―]/.test(line)) {
      // Strip the dash prefix and trim
      attributionLines.push(line.replace(/^[—―]\s*/, '').trim());
    } else {
      quoteLines.push(line);
    }
  }

  // Strip leading/trailing typographic quotes from the full quote text
  let quoteText = quoteLines.join('\n').trim();
  quoteText = quoteText.replace(/^[""]/, '').replace(/[""]$/, '').trim();

  const attribution = attributionLines.length > 0 ? attributionLines.join(', ') : null;

  return { quoteText, attribution };
}

export default function QuoteStep({ step, card, isActive }: QuoteStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { quoteText, attribution } = parseQuoteContent(step.content);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Subtle radial glow from category accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${categoryInfo.accent}12` }}
        />
      </motion.div>

      {/* Decorative opening quote mark — top-left area */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: -12, y: -12 }}
        animate={isActive ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pointer-events-none absolute left-5 top-6 select-none text-8xl font-black leading-none"
        style={{ color: `${categoryInfo.accent}22` }}
      >
        &ldquo;
      </motion.div>

      {/* Closing quote mark — bottom-right area */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: 12, y: 12 }}
        animate={isActive ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
        className="pointer-events-none absolute bottom-6 right-5 select-none text-8xl font-black leading-none"
        style={{ color: `${categoryInfo.accent}18` }}
      >
        &rdquo;
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex max-w-xs flex-col items-center gap-6 px-8">
        {/* Quote text */}
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.85, ease: 'easeOut', delay: 0.1 }}
          className="text-center text-xl font-light italic leading-relaxed text-white/90"
          style={{ wordBreak: 'keep-all', lineHeight: 1.75 }}
        >
          {quoteText.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </motion.blockquote>

        {/* Attribution */}
        {attribution && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2"
          >
            {/* Separator line with category accent color */}
            <div
              className="h-px w-10"
              style={{ backgroundColor: categoryInfo.accent }}
            />
            <p
              className="text-center text-sm text-white/50"
              style={{ wordBreak: 'keep-all' }}
            >
              — {attribution}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
