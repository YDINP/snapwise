'use client';

import { motion } from 'motion/react';

interface DialogueBubbleProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  className?: string;
}

export function DialogueBubble({
  children,
  direction = 'left',
  className = ''
}: DialogueBubbleProps) {
  const tailClass = direction === 'left' ? 'dialogue-tail-left' : 'dialogue-tail-right';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative px-5 py-4
        bg-white/15 backdrop-blur-md
        rounded-2xl
        text-white/90 text-base leading-relaxed
        ${tailClass}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
