'use client';

import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { parseInline } from '@/lib/renderContent';

interface StepsStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
}

interface ParsedStep {
  number: number;
  title: string;
  description: string;
}

interface ParsedSteps {
  header: string;
  steps: ParsedStep[];
}

function parseStepsContent(content: string): ParsedSteps {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const header: string[] = [];
  const steps: ParsedStep[] = [];

  for (const line of lines) {
    // Match lines starting with a number followed by . or )
    const match = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (match) {
      const number = parseInt(match[1], 10);
      const rest = match[2];
      const pipeIndex = rest.indexOf('|');
      if (pipeIndex !== -1) {
        steps.push({
          number,
          title: rest.slice(0, pipeIndex).trim(),
          description: rest.slice(pipeIndex + 1).trim(),
        });
      } else {
        steps.push({
          number,
          title: rest.trim(),
          description: '',
        });
      }
    } else {
      // Non-numbered line: treat as header
      header.push(line);
    }
  }

  return {
    header: header.join(' '),
    steps,
  };
}

export default function StepsStep({ step, card, isActive }: StepsStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { header, steps } = parseStepsContent(step.content);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 px-6 py-8">
        {/* Section label — teaser, not spoiler */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <p
            className="mb-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: categoryInfo.accent, opacity: 0.9 }}
          >
            이야기의 흐름
          </p>
          {header && (
            <p
              className="text-sm font-semibold text-white/70"
              style={{ wordBreak: 'keep-all' }}
            >
              {header}
            </p>
          )}
        </motion.div>

        {/* Steps list */}
        <div className="flex flex-col">
          {steps.map((item, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={item.number} className="flex items-stretch gap-3">
                {/* Left column: badge + connector */}
                <div className="flex w-8 shrink-0 flex-col items-center">
                  {/* Number badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isActive ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.12 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: categoryInfo.accent }}
                  >
                    {item.number}
                  </motion.div>

                  {/* Connector: negative margin bridges the mb-3 gap to the next badge */}
                  {!isLast && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={isActive ? { scaleY: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                      className="mt-1 w-px flex-1 bg-white/20"
                      style={{ transformOrigin: 'top', marginBottom: '-12px' }}
                    />
                  )}
                </div>

                {/* Step card — title only, descriptions hidden to prevent story spoilers */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease: 'easeOut' }}
                  className={`flex flex-1 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm${isLast ? '' : ' mb-3'}`}
                >
                  <p
                    className="text-sm font-semibold leading-snug text-white"
                    style={{ wordBreak: 'keep-all', textWrap: 'balance' }}
                  >
                    {parseInline(item.title, categoryInfo.accent)}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
