'use client';

import { motion } from 'motion/react';

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepProgressBar({ totalSteps, currentStep }: StepProgressBarProps) {
  return (
    <div className="flex gap-1 px-3 pt-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className="h-[3px] rounded-full flex-1 bg-white/30 overflow-hidden"
        >
          {index < currentStep && (
            <div className="h-full bg-white" />
          )}
          {index === currentStep && (
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
