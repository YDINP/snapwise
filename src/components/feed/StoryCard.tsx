'use client';

import { useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { CardMeta } from '@/types/content';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import StepProgressBar from '@/components/story/StepProgressBar';
import StepRenderer from '@/components/story/StepRenderer';

interface StoryCardProps {
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
  onComplete?: () => void;
}

export default function StoryCard({ card, isActive, nextCard, onComplete }: StoryCardProps) {
  const { currentStep, goNext, goPrev, isFirstStep, isLastStep, totalSteps } = useStepNavigation({
    totalSteps: card.steps.length,
    isActive,
    onComplete,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleTap = useCallback((e: React.MouseEvent) => {
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

  const step = card.steps[currentStep];
  if (!step) return null;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" onClick={handleTap}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <StepProgressBar totalSteps={totalSteps} currentStep={currentStep} />
      </div>

      {/* Step content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <StepRenderer
            step={step}
            card={card}
            isActive={isActive}
            nextCard={nextCard}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
