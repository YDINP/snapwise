'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'snapwise-anonymous-id';

/** localStorage에서 익명 UUID를 가져오거나 없으면 새로 생성 */
function getOrCreateAnonymousId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch {
    // SSR or private browsing 환경 대응
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** 익명 사용자 ID를 반환하는 훅 (lazy init, stable ref) */
export function useAnonymousId(): string {
  const idRef = useRef<string>('');

  useEffect(() => {
    if (!idRef.current) {
      idRef.current = getOrCreateAnonymousId();
    }
  }, []);

  // 초기 렌더에서는 빈 문자열 — useEffect 이후 hydrate
  return idRef.current;
}

/** 동기 버전 (Client Component 마운트 이후 안전하게 사용) */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  return getOrCreateAnonymousId();
}
