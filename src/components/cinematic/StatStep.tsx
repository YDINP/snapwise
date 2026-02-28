'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';

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
  items: StatItem[];
  bigStat: string;
  description: string;
}

function splitPipeLine(line: string): StatItem {
  const [left, right] = line.split('|').map(s => s.trim());
  const hasDigit = (s: string) => /\d/.test(s);
  const leftHasDigit = hasDigit(left);
  const rightHasDigit = hasDigit(right ?? '');

  if (leftHasDigit && !rightHasDigit) return { value: left, label: right ?? '' };
  return { value: right ?? '', label: left };
}

function looksLikeStat(line: string): boolean {
  return /^[\d\s%×배명원개초km㎞kg,.\-+~x]+$/.test(line.trim()) ||
    /^\d/.test(line.trim()) ||
    /[%배명원개×]/.test(line.trim());
}

/** 값이 긴 텍스트인지 감지 — 15자 초과이거나 숫자 비율이 20% 미만이면 텍스트 값으로 판단 */
function isTextValue(value: string): boolean {
  if (value.length > 15) return true;
  const digitCount = (value.match(/\d/g) ?? []).length;
  const digitRatio = digitCount / value.length;
  return digitRatio < 0.2;
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

  if (pipeLines.length > 0) {
    const items = pipeLines.map(splitPipeLine);
    const description = plainLines.join('\n');
    return { mode: 'multi', items, bigStat: '', description };
  }

  if (rawLines.length > 0 && looksLikeStat(rawLines[0])) {
    const bigStat = rawLines[0];
    const description = rawLines.slice(1).join('\n');
    return { mode: 'single', items: [], bigStat, description };
  }

  const bigStat = rawLines[0] ?? '';
  const description = rawLines.slice(1).join('\n');
  return { mode: 'single', items: [], bigStat, description };
}

export default function StatStep({ step, card, isActive }: StatStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const parsed = parseStatContent(step.content);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#060606]" />

      {/* Ambient glow - top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full blur-[100px]"
        style={{ backgroundColor: `${categoryInfo.accent}15` }}
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">
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
/* Single big stat — editorial magazine style                          */
/* ------------------------------------------------------------------ */

interface SingleStatProps {
  bigStat: string;
  description: string;
  accent: string;
  isActive: boolean;
}

function SingleStat({ bigStat, description, accent, isActive }: SingleStatProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Accent dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isActive ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: accent }}
      />

      {/* Big number */}
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-7xl font-black leading-none tracking-tighter"
        style={{
          color: accent,
          textShadow: `0 0 40px ${accent}50, 0 4px 20px ${accent}30`,
        }}
      >
        {bigStat}
      </motion.p>

      {/* Expanding line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="h-px w-20 origin-center"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-base font-medium leading-relaxed text-white/60"
          style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
        >
          {renderWithLineBreaks(description, accent)}
        </motion.p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multi stats — Hero number + horizontal bar infographic              */
/* ------------------------------------------------------------------ */

interface MultiStatsProps {
  items: StatItem[];
  description: string;
  accent: string;
  isActive: boolean;
}

function MultiStats({ items, description, accent, isActive }: MultiStatsProps) {
  // 모든 아이템 값이 텍스트 값인지 판단
  const allTextValues = items.length > 0 && items.every(item => isTextValue(item.value));

  if (allTextValues) {
    return (
      <TextListStats
        items={items}
        description={description}
        accent={accent}
        isActive={isActive}
      />
    );
  }

  // 기존 hero + secondary cards 레이아웃 (숫자 값 유지)
  const hero = items[0];
  const rest = items.slice(1);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      {/* ── Hero section: giant number ── */}
      {hero && (
        <div className="flex flex-col items-center gap-3">
          {/* Label above */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40"
            style={{ wordBreak: 'keep-all' }}
          >
            {hero.label}
          </motion.p>

          {/* Number */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`text-center font-black leading-none tracking-tighter ${
              hero.value.length <= 4 ? 'text-8xl' :
              hero.value.length <= 8 ? 'text-7xl' :
              hero.value.length <= 12 ? 'text-5xl' : 'text-4xl'
            }`}
            style={{
              color: accent,
              textShadow: `0 0 60px ${accent}40, 0 0 120px ${accent}20`,
            }}
          >
            {hero.value}
          </motion.p>

          {/* Accent bar under hero */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isActive ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="h-[3px] w-12 origin-center rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>
      )}

      {/* ── Secondary stats: glass cards ── */}
      {rest.length > 0 && (
        <div className="flex w-full flex-col gap-3">
          {rest.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.75 + i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex items-center justify-between rounded-xl px-4 py-3.5 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${accent}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Subtle inner glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  background: `linear-gradient(135deg, ${accent}, transparent 60%)`,
                }}
              />
              <span
                className="relative text-[13px] font-medium text-white/55"
                style={{ wordBreak: 'keep-all' }}
              >
                {item.label}
              </span>
              <span
                className="relative text-lg font-extrabold tracking-tight"
                style={{
                  color: accent,
                  textShadow: `0 0 16px ${accent}30`,
                }}
              >
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* description: hero 모드에서도 하단 표시 */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center text-[12px] font-medium text-white/30 leading-relaxed"
          style={{ wordBreak: 'keep-all' }}
        >
          {renderWithLineBreaks(description, accent)}
        </motion.p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Text list stats — 모든 값이 텍스트일 때의 클린 리스트 레이아웃       */
/* ------------------------------------------------------------------ */

interface TextListStatsProps {
  items: StatItem[];
  description: string;
  accent: string;
  isActive: boolean;
}

function TextListStats({ items, description, accent, isActive }: TextListStatsProps) {
  return (
    <div className="flex w-full flex-col">
      {/* Stat rows with dividers */}
      <div className="flex w-full flex-col">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col">
            {/* Divider — accent color, 첫 번째 행 위에도 표시 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isActive ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="h-px w-full origin-left"
              style={{
                background: `linear-gradient(90deg, ${accent}30, transparent 80%)`,
              }}
            />

            {/* Row content */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col py-5 px-2"
            >
              {/* Label */}
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35"
                style={{ wordBreak: 'keep-all' }}
              >
                {item.label}
              </span>

              {/* Value */}
              <span
                className="mt-1.5 text-[15px] font-semibold leading-snug text-white/85"
                style={{ wordBreak: 'keep-all' }}
              >
                {item.value}
              </span>
            </motion.div>
          </div>
        ))}

        {/* 마지막 항목 하단 구분선 */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isActive ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 + items.length * 0.1 }}
          className="h-px w-full origin-left"
          style={{
            background: `linear-gradient(90deg, ${accent}30, transparent 80%)`,
          }}
        />
      </div>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 + items.length * 0.1 }}
          className="mt-6 text-[12px] font-medium text-white/30 leading-relaxed"
          style={{ wordBreak: 'keep-all' }}
        >
          {renderWithLineBreaks(description, accent)}
        </motion.p>
      )}
    </div>
  );
}
