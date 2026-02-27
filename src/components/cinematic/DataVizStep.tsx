'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface DataVizStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface ParsedDataViz {
  numericValue: number;
  prefix: string;
  suffix: string;
  rawValue: string;
  label: string;
  description: string;
}

/**
 * 값 문자열에서 숫자, 접두사, 접미사를 파싱
 * 예: "3,200만명" → { prefix: '', numericValue: 3200, suffix: '만명' }
 *     "$42억" → { prefix: '$', numericValue: 42, suffix: '억' }
 *     "98.6%" → { prefix: '', numericValue: 98.6, suffix: '%' }
 */
function parseNumericValue(raw: string): { prefix: string; numericValue: number; suffix: string } {
  const cleaned = raw.trim();

  // 접두사 추출 ($ € ¥ ₩ 등 통화 기호)
  const prefixMatch = cleaned.match(/^([^\d]+)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const afterPrefix = cleaned.slice(prefix.length);

  // 숫자 추출 (콤마 허용, 소수점 허용)
  const numMatch = afterPrefix.match(/^([\d,]+\.?\d*)/);
  if (!numMatch) {
    return { prefix: '', numericValue: 0, suffix: cleaned };
  }

  const numStr = numMatch[1].replace(/,/g, '');
  const numericValue = parseFloat(numStr);
  const suffix = afterPrefix.slice(numMatch[1].length);

  return { prefix, numericValue, suffix };
}

/**
 * 콘텐츠 파싱:
 * 첫 줄 = "숫자값 | 레이블" 또는 "숫자값" 형식
 * 나머지 줄 = description
 */
function parseDataVizContent(content: string): ParsedDataViz {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length === 0) {
    return { numericValue: 0, prefix: '', suffix: '', rawValue: '0', label: '', description: '' };
  }

  const firstLine = lines[0];
  let rawValue = firstLine;
  let label = '';

  if (firstLine.includes('|')) {
    const parts = firstLine.split('|').map(s => s.trim());
    // 숫자 포함 쪽이 value
    const hasDigit = (s: string) => /\d/.test(s);
    if (hasDigit(parts[0]) && !hasDigit(parts[1] ?? '')) {
      rawValue = parts[0];
      label = parts[1] ?? '';
    } else {
      rawValue = parts[1] ?? parts[0];
      label = parts[0];
    }
  }

  const description = lines.slice(1).join('\n');
  const { prefix, numericValue, suffix } = parseNumericValue(rawValue);

  return { numericValue, prefix, suffix, rawValue, label, description };
}

/** 카운트업 훅 */
function useCountUp(target: number, isActive: boolean, duration: number = 1800): number {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setCount(0);
      startedRef.current = false;
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    if (target === 0) {
      setCount(0);
      return;
    }

    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const timer = setInterval(() => {
      step++;
      const progress = easeOut(step / steps);
      setCount(parseFloat((target * progress).toFixed(target % 1 === 0 ? 0 : 1)));
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, target, duration]);

  return count;
}

export default function DataVizStep({ step, card, isActive }: DataVizStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const parsed = parseDataVizContent(step.content);
  const animatedCount = useCountUp(parsed.numericValue, isActive);

  // 소수점 포함 여부에 따라 포맷
  const isFloat = parsed.numericValue % 1 !== 0;
  const displayValue = isFloat
    ? animatedCount.toFixed(1)
    : Math.round(animatedCount).toLocaleString('ko-KR');

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-[#070707]" />

      {/* 상단 그라데이션 글로우 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full blur-[100px]"
        style={{ backgroundColor: `${categoryInfo.accent}18` }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-sm">
        {/* 레이블 */}
        {parsed.label && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-xs font-bold uppercase tracking-[0.25em] text-white/35"
            style={{ wordBreak: 'keep-all' }}
          >
            {parsed.label}
          </motion.p>
        )}

        {/* 메인 숫자 — 카운트업 */}
        <div className="flex items-baseline gap-1">
          {parsed.prefix && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={isActive ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-5xl font-black"
              style={{ color: `${categoryInfo.accent}CC` }}
            >
              {parsed.prefix}
            </motion.span>
          )}

          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-8xl font-black leading-none tracking-tighter tabular-nums"
            style={{
              color: categoryInfo.accent,
              textShadow: `0 0 60px ${categoryInfo.accent}50, 0 0 120px ${categoryInfo.accent}20`,
            }}
          >
            {displayValue}
          </motion.span>

          {parsed.suffix && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={isActive ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-3xl font-black"
              style={{ color: `${categoryInfo.accent}AA` }}
            >
              {parsed.suffix}
            </motion.span>
          )}
        </div>

        {/* 구분선 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="h-px w-16 origin-center"
          style={{
            background: `linear-gradient(90deg, transparent, ${categoryInfo.accent}, transparent)`,
          }}
        />

        {/* 설명 */}
        {parsed.description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="text-center text-sm font-medium leading-relaxed text-white/50"
            style={{ wordBreak: 'keep-all', textWrap: 'balance' as React.CSSProperties['textWrap'] }}
          >
            {parsed.description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
