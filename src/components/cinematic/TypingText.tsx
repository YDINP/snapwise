'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface BoldRange {
  start: number;
  end: number;
}

/** Strip **bold** markers and record character ranges that should be bold */
function preprocessBold(raw: string): { clean: string; boldRanges: BoldRange[] } {
  const boldRanges: BoldRange[] = [];
  let clean = '';
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '*' && i + 1 < raw.length && raw[i + 1] === '*') {
      const closeIdx = raw.indexOf('**', i + 2);
      if (closeIdx !== -1) {
        const start = clean.length;
        clean += raw.slice(i + 2, closeIdx);
        boldRanges.push({ start, end: clean.length });
        i = closeIdx + 2;
        continue;
      }
    }
    clean += raw[i];
    i++;
  }
  return { clean, boldRanges };
}

/** Render a line segment with bold ranges applied */
function renderWithBold(text: string, globalOffset: number, boldRanges: BoldRange[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let pos = 0;

  for (const { start, end } of boldRanges) {
    const localStart = Math.max(0, start - globalOffset);
    const localEnd = Math.min(text.length, end - globalOffset);
    if (localStart >= text.length || localEnd <= 0 || localStart >= localEnd) continue;

    if (localStart > pos) nodes.push(text.slice(pos, localStart));
    nodes.push(
      <strong key={`b-${globalOffset + localStart}`} className="font-bold">
        {text.slice(localStart, localEnd)}
      </strong>
    );
    pos = localEnd;
  }

  if (pos < text.length) nodes.push(text.slice(pos));
  return nodes.length > 0 ? nodes : [text];
}

interface TypingTextProps {
  text: string;
  isActive: boolean;
  speed?: number;
  startDelay?: number;
}

export default function TypingText({
  text,
  isActive,
  speed = 35,
  startDelay = 600,
}: TypingTextProps) {
  const { clean, boldRanges } = useMemo(() => preprocessBold(text), [text]);

  const [displayedLength, setDisplayedLength] = useState(0);
  const [started, setStarted] = useState(false);
  const prevTextRef = useRef(text);

  // Reset when text changes
  useEffect(() => {
    if (text !== prevTextRef.current) {
      setDisplayedLength(0);
      setStarted(false);
      prevTextRef.current = text;
    }
  }, [text]);

  // Handle isActive changes — reset & start delay
  useEffect(() => {
    if (!isActive) {
      setDisplayedLength(0);
      setStarted(false);
      return;
    }
    if (!started) {
      const timer = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(timer);
    }
  }, [isActive, started, startDelay]);

  // Typing loop — operates on clean text (no ** markers)
  useEffect(() => {
    if (!started || displayedLength >= clean.length) return;

    const char = clean[displayedLength];
    // Pause longer on sentence-ending punctuation
    const delay = /[.!?。""]/.test(char) ? speed * 3 : speed;

    const timer = setTimeout(() => {
      setDisplayedLength(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [started, displayedLength, clean, speed]);

  const visibleText = clean.slice(0, displayedLength);
  const isTyping = started && displayedLength < clean.length;

  // Split into lines, tracking offsets for bold range mapping
  const rawLines = visibleText.split('\n');
  const lines: { text: string; offset: number }[] = [];
  let offset = 0;
  for (const line of rawLines) {
    if (line.trim() !== '') lines.push({ text: line, offset });
    offset += line.length + 1;
  }

  return (
    <>
      {lines.map(({ text: lineText, offset: lineOffset }, i) => (
        <span key={i}>
          {renderWithBold(lineText, lineOffset, boldRanges)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
      {isTyping && (
        <span className="ml-0.5 inline-block animate-pulse text-gray-400">▌</span>
      )}
    </>
  );
}
