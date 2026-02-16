import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}
