'use client';

import { motion } from 'motion/react';

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepProgressBar({ totalSteps, currentStep }: StepProgressBarProps) {
  // Thinner bars for many steps (8+), ultra-thin for 12+
  const barHeight = totalSteps > 12 ? 'h-[2px]' : totalSteps > 8 ? 'h-[2.5px]' : 'h-[3px]';
  const gapSize = totalSteps > 10 ? 'gap-0.5' : 'gap-1';

  return (
    <div className={`flex ${gapSize} px-3 pt-2`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`${barHeight} rounded-full flex-1 bg-white/30 overflow-hidden`}
          style={{ minWidth: '2px' }}
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
