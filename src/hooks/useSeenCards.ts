'use client';

import { useCallback, useEffect } from 'react';

const STORAGE_KEY = 'snapwise-seen';
const LEGACY_KEY = 'snapwise_seen';
const MAX_SEEN = 50;

function getSeen(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSeenCards() {
  // 마이그레이션: 구버전 키(snapwise_seen) 데이터를 신버전 키(snapwise-seen)로 이전
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, legacy);
      }
      localStorage.removeItem(LEGACY_KEY);
    }
  }, []); // 마운트 시 1회

  const markSeen = useCallback((slug: string) => {
    const seen = getSeen();
    if (seen.includes(slug)) return;
    seen.unshift(slug);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen.slice(0, MAX_SEEN)));
    } catch {}
  }, []);

  const getSeenSet = useCallback((): Set<string> => {
    return new Set(getSeen());
  }, []);

  return { markSeen, getSeenSet };
}
