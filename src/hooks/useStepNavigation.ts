'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseStepNavigationOptions {
  totalSteps: number;
  isActive: boolean;
  onComplete?: () => void; // called when user tries to go past last step
}

export function useStepNavigation({ totalSteps, isActive, onComplete }: UseStepNavigationOptions) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step when card becomes active
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
    }
  }, [isActive]);

  const goNext = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= totalSteps - 1) {
        onComplete?.();
        return prev;
      }
      return prev + 1;
    });
  }, [totalSteps, onComplete]);

  const goPrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  // Keyboard navigation (only when active)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, goNext, goPrev]);

  return {
    currentStep,
    goNext,
    goPrev,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep >= totalSteps - 1,
    totalSteps,
  };
}
