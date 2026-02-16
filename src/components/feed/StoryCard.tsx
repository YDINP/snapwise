'use client';

import { useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { CardMeta } from '@/types/content';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import StepProgressBar from '@/components/story/StepProgressBar';
import StepRenderer from '@/components/story/StepRenderer';
import CinematicRenderer from '@/components/cinematic/CinematicRenderer';

interface StoryCardProps {
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
  onComplete?: () => void;
}

export default function StoryCard({ card, isActive, nextCard, onComplete }: StoryCardProps) {
  const { currentStep, goNext, goPrev, goToStart, isFirstStep, totalSteps } = useStepNavigation({
    totalSteps: card.steps.length,
    isActive,
    slug: card.slug,
    onComplete,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const handleTap = useCallback((e: React.MouseEvent) => {
    if (isSwiping.current) { isSwiping.current = false; return; }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const threshold = rect.width * 0.3;

    if (x < threshold) {
      goPrev();
    } else {
      goNext();
    }
  }, [goNext, goPrev]);

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
      if (dx < 0) goNext();  // swipe left → next
      else goPrev();          // swipe right → prev
    }
  }, [goNext, goPrev]);

  const step = card.steps[currentStep];
  if (!step) return null;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" onClick={handleTap} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <StepProgressBar totalSteps={totalSteps} currentStep={currentStep} />
      </div>

      {/* 처음으로 button — only visible after step 0 */}
      {!isFirstStep && (
        <button
          onClick={(e) => { e.stopPropagation(); goToStart(); }}
          className="absolute top-7 left-3 z-50 flex items-center gap-2 rounded-full bg-black/30 px-14 py-4 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          ← 처음으로
        </button>
      )}

      {/* Step content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0.6, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.6, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
