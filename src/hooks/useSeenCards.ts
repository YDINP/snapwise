'use client';

import { useCallback } from 'react';

const SEEN_KEY = 'snapwise_seen';
const MAX_SEEN = 50;

function getSeen(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SEEN_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSeenCards() {
  const markSeen = useCallback((slug: string) => {
    const seen = getSeen();
    if (seen.includes(slug)) return;
    seen.unshift(slug);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(0, MAX_SEEN)));
    } catch {}
  }, []);

  const getSeenSet = useCallback((): Set<string> => {
    return new Set(getSeen());
  }, []);

  return { markSeen, getSeenSet };
}
