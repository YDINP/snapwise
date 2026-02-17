'use client';

import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';
import { findGlossaryTerms } from '@/lib/glossary';

interface StepGlossaryProps {
  /** Current step's text content */
  stepContent: string;
  /** Card title — used to filter out on-topic terms */
  cardTitle: string;
  /** Card tags — used to filter out on-topic terms */
  cardTags: string[];
  isActive: boolean;
}

export default function StepGlossary({ stepContent, cardTitle, cardTags, isActive }: StepGlossaryProps) {
  const terms = findGlossaryTerms(stepContent, cardTitle, cardTags);

  if (terms.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={isActive ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="absolute bottom-3 left-3 right-3 z-40"
    >
      <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-lg">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          <HelpCircle size={10} />
          용어 해설
        </div>
        <div className="space-y-1.5">
          {terms.slice(0, 3).map((entry, i) => (
            <div key={i} className="flex gap-2 text-xs leading-snug">
              <span className="shrink-0 font-bold text-white/80">{entry.term}</span>
              <span className="text-white/50">{entry.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
