'use client';

import { motion } from 'motion/react';

interface CharacterAvatarProps {
  emoji: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  accentColor?: string;
  speaking?: boolean;
}

const sizeMap = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-[72px] h-[72px] text-3xl',
};

export function CharacterAvatar({
  emoji,
  name,
  size = 'md',
  accentColor = 'rgba(255, 255, 255, 0.3)',
  speaking = false
}: CharacterAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`
          ${sizeMap[size]}
          rounded-full
          flex items-center justify-center
          bg-white/10 backdrop-blur-sm
          border-2
          ${speaking ? 'speaking-pulse' : ''}
        `}
        style={{ borderColor: accentColor }}
      >
        <span>{emoji}</span>
      </motion.div>

      <span className="text-xs text-white/60 font-medium">
        {name}
      </span>
    </div>
  );
}
