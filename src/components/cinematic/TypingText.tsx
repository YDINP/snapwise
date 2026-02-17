'use client';

import { useState, useEffect, useRef } from 'react';

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

  // Typing loop
  useEffect(() => {
    if (!started || displayedLength >= text.length) return;

    const char = text[displayedLength];
    // Pause longer on sentence-ending punctuation
    const delay = /[.!?。""]/.test(char) ? speed * 3 : speed;

    const timer = setTimeout(() => {
      setDisplayedLength(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [started, displayedLength, text, speed]);

  const visibleText = text.slice(0, displayedLength);
  const isTyping = started && displayedLength < text.length;

  // Render with line breaks (matching renderContent logic)
  const lines = visibleText.split('\n').filter(line => line.trim() !== '');

  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
      {isTyping && (
        <span className="ml-0.5 inline-block animate-pulse text-gray-400">▌</span>
      )}
    </>
  );
}
