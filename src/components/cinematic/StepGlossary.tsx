'use client';

import type { GlossaryItem } from '@/types/content';
import { HelpCircle } from 'lucide-react';

interface StepGlossaryProps {
  content: string;
  glossary?: GlossaryItem[];
}

export default function StepGlossary({ content, glossary }: StepGlossaryProps) {
  if (!glossary || glossary.length === 0) return null;

  // Filter terms that appear in this step's content
  const matched = glossary.filter(item =>
    content.includes(item.term)
  );

  if (matched.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-40">
      <div className="rounded-xl bg-black/50 px-4 py-3 backdrop-blur-md">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
          <HelpCircle size={10} />
          용어 해설
        </div>
        <div className="space-y-1">
          {matched.map((item, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="shrink-0 font-bold text-white/90">{item.term}</span>
              <span className="text-white/60">{item.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
