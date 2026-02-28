'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { CardMeta } from '@/types/content';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import StepProgressBar from '@/components/story/StepProgressBar';
import StepRenderer from '@/components/story/StepRenderer';
import CinematicRenderer from '@/components/cinematic/CinematicRenderer';
import StepGlossary from '@/components/cinematic/StepGlossary';
import WordCountBadge from '@/components/ui/WordCountBadge';
import { getCategoryInfo } from '@/lib/categories';

interface StoryCardProps {
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
  onComplete?: () => void;
  /** Top offset in px when rendered below a fixed nav bar */
  topOffset?: number;
}

/** 스텝 타입에 따른 전환 애니메이션 variant 결정 */
type TransitionVariant = 'snap' | 'zoom' | 'dramatic' | 'default';

function getTransitionVariant(stepType: string): TransitionVariant {
  if (stepType === 'fact' || stepType === 'cliffhanger') return 'snap';
  if (stepType === 'cinematic-hook' || stepType === 'impact' || stepType === 'splash') return 'zoom';
  if (stepType === 'reveal-title') return 'dramatic';
  return 'default';
}

interface MotionConfig {
  initial: { opacity: number; y?: number; scale?: number };
  animate: { opacity: number; y?: number; scale?: number };
  exit: { opacity: number; y?: number; scale?: number };
  duration: number;
}

function getMotionConfig(variant: TransitionVariant): MotionConfig {
  switch (variant) {
    case 'snap':
      return {
        initial: { opacity: 0.6, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 0 },
        duration: 0.05,
      };
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 0.97 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.02 },
        duration: 0.25,
      };
    case 'dramatic':
      return {
        initial: { opacity: 0, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 0 },
        duration: 0.5,
      };
    default:
      return {
        initial: { opacity: 0.88, y: 4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
        duration: 0.15,
      };
  }
}

export default function StoryCard({ card, isActive, nextCard, onComplete, topOffset = 0 }: StoryCardProps) {
  const { currentStep, goNext, goPrev, goToStep, goToStart, isFirstStep, totalSteps } = useStepNavigation({
    totalSteps: card.steps.length,
    isActive,
    slug: card.slug,
    onComplete,
  });

  const categoryInfo = getCategoryInfo(card.category);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  // 탭 힌트 오버레이 (첫 스텝에서 3초 후 fade-out)
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    if (isActive && currentStep === 0) {
      setShowTapHint(true);
      const timer = setTimeout(() => setShowTapHint(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowTapHint(false);
    }
  }, [isActive, currentStep]);

  // 진행 힌트 화살표 (3초 이상 정지 시 표시)
  const [showProgressHint, setShowProgressHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHintTimer = useCallback(() => {
    setShowProgressHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (isActive) {
      hintTimerRef.current = setTimeout(() => setShowProgressHint(true), 3000);
    }
  }, [isActive]);

  useEffect(() => {
    resetHintTimer();
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [currentStep, isActive, resetHintTimer]);

  const handleTap = useCallback((e: React.MouseEvent) => {
    if (isSwiping.current) { isSwiping.current = false; return; }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const threshold = rect.width * 0.3;

    resetHintTimer();
    if (x < threshold) {
      goPrev();
    } else {
      goNext();
    }
  }, [goNext, goPrev, resetHintTimer]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwiping.current = true;
      resetHintTimer();
      if (dx < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev, resetHintTimer]);

  const step = card.steps[currentStep];
  if (!step) return null;

  const stepType = step.type as string;
  const variant = getTransitionVariant(stepType);
  const motionConfig = getMotionConfig(variant);
  const isOutroStep = stepType === 'outro';

  // 진행 힌트 화살표 표시 조건: outro가 아닌 스텝, isActive
  const canShowHint = isActive && !isOutroStep;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="absolute left-0 right-0 z-50" style={{ top: topOffset }}>
        <StepProgressBar
          totalSteps={card.steps.length}
          currentStep={currentStep}
          onJump={goToStep}
          accentColor={categoryInfo.accent}
        />
      </div>

      {/* 처음으로 버튼 — step 0 이후에만 표시 */}
      {!isFirstStep && (
        <button
          onClick={(e) => { e.stopPropagation(); goToStart(); }}
          className="absolute left-3 z-50 flex items-center gap-2 rounded-full bg-black/30 px-5 py-2.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50"
          style={{ top: topOffset + 16 }}
        >
          ← 처음으로
        </button>
      )}

      {/* Step type badge + word count badge */}
      {totalSteps > 0 && step && (
        <div
          className="absolute right-3 z-50 flex items-center gap-1.5"
          style={{ top: topOffset + 16 }}
        >
          <WordCountBadge content={step.content} />
          <div className="rounded-full bg-black/30 px-3 py-1 text-center text-[10px] font-medium text-white/60 backdrop-blur-sm">
            {step.type}
          </div>
        </div>
      )}

      {/* Step content — 타입별 전환 애니메이션 */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentStep}
          initial={motionConfig.initial}
          animate={motionConfig.animate}
          exit={motionConfig.exit}
          transition={{ duration: motionConfig.duration, ease: 'easeOut' }}
          className="w-full h-full"
        >
          {card.isCinematic ? (
            <CinematicRenderer
              step={step}
              card={card}
              isActive={isActive}
              nextCard={nextCard}
            />
          ) : (
            <StepRenderer
              step={step}
              card={card}
              isActive={isActive}
              nextCard={nextCard}
            />
          )}
          {/* Glossary — shown per step when technical terms are detected */}
          {card.isCinematic && step.type !== 'cinematic-hook' && step.type !== 'reveal-title' && step.type !== 'outro' && (
            <StepGlossary
              stepContent={step.content}
              cardTitle={card.title}
              cardTags={card.tags}
              isActive={isActive}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 하단 탭존 — 화면 하단 20%, 투명 클릭 영역 (goNext 트리거) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40"
        style={{ height: '20%' }}
        onClick={(e) => {
          e.stopPropagation();
          resetHintTimer();
          goNext();
        }}
        aria-label="다음 스텝"
      />

      {/* 탭 힌트 오버레이 — 첫 스텝에서만 3초 표시 후 fade-out
           cinematic-hook 타입은 컴포넌트 내부에 "탭하여 시작" 힌트가 있으므로 제외 */}
      <AnimatePresence>
        {showTapHint && stepType !== 'cinematic-hook' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center pb-20"
          >
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2 rounded-full bg-black/50 px-5 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-sm"
            >
              탭하면 다음
              <span>→</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 진행 힌트 화살표 — 3초 정지 후 등장, outro 제외 */}
      <AnimatePresence>
        {canShowHint && showProgressHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
              className="text-white/30 text-lg"
            >
              ↓
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
