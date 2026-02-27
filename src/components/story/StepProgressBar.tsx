'use client';

import { motion } from 'motion/react';

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number;
  /** 세그먼트 클릭 시 해당 스텝으로 점프 (선택적) */
  onJump?: (step: number) => void;
}

/**
 * StepProgressBar v2 — 세그먼트형
 * - 스텝별 개별 칸으로 구성 (flex row)
 * - 읽은 스텝: 흰색 (full width)
 * - 현재 스텝: 흰색 + scale-x 채우기 애니메이션
 * - 미읽음: 흰색/25
 * - 우측 "N/M" 숫자 카운터
 * - 각 세그먼트 클릭 → 해당 스텝 점프
 */
export default function StepProgressBar({ totalSteps, currentStep, onJump }: StepProgressBarProps) {
  const barHeight = totalSteps > 12 ? 'h-[2px]' : totalSteps > 8 ? 'h-[2.5px]' : 'h-[3px]';
  const gapSize = totalSteps > 10 ? 'gap-[3px]' : 'gap-1';

  return (
    <div className="flex items-center gap-2 px-3 pt-2">
      {/* 세그먼트 목록 */}
      <div className={`flex ${gapSize} flex-1`}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isPast = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <button
              key={index}
              onClick={onJump ? () => onJump(index) : undefined}
              disabled={!onJump}
              className={`${barHeight} flex-1 rounded-full overflow-hidden bg-white/20 relative ${onJump ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ minWidth: '2px' }}
              aria-label={`${index + 1}번째 스텝으로 이동`}
            >
              {/* 읽은 스텝: 즉시 채워진 흰색 */}
              {isPast && (
                <div className="absolute inset-0 bg-white" />
              )}

              {/* 현재 스텝: 애니메이션으로 채워짐 */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* N/M 카운터 */}
      <span className="flex-shrink-0 text-[10px] font-semibold tabular-nums text-white/40 leading-none">
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  );
}
