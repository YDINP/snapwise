'use client';

import { useState, useCallback, useEffect } from 'react';

const PROGRESS_KEY = 'snapwise-progress';

function loadProgress(slug: string): number {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return data[slug] || 0;
  } catch {
    return 0;
  }
}

function saveProgress(slug: string, step: number) {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    data[slug] = step;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {}
}

interface UseStepNavigationOptions {
  totalSteps: number;
  isActive: boolean;
  slug?: string;
  onComplete?: () => void;
  /** progress 저장 시 이 값으로 상한 처리 (광고 스텝 인덱스 저장 방지) */
  progressMax?: number;
}

export function useStepNavigation({ totalSteps, isActive, slug, onComplete, progressMax }: UseStepNavigationOptions) {
  const [currentStep, setCurrentStep] = useState(0);

  // Load saved progress when card becomes active
  useEffect(() => {
    if (isActive) {
      if (slug) {
        const saved = loadProgress(slug);
        setCurrentStep(Math.min(saved, totalSteps - 1));
      } else {
        setCurrentStep(0);
      }
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save progress on step change (광고 스텝 인덱스는 저장하지 않음)
  useEffect(() => {
    if (slug && isActive) {
      const stepToSave = progressMax !== undefined
        ? Math.min(currentStep, progressMax)
        : currentStep;
      saveProgress(slug, stepToSave);
    }
  }, [slug, currentStep, isActive, progressMax]);

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

  const goToStart = useCallback(() => {
    setCurrentStep(0);
    if (slug) saveProgress(slug, 0);
  }, [slug]);

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
    goToStart,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep >= totalSteps - 1,
    totalSteps,
  };
}
