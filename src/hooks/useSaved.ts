'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CardMeta } from '@/types/content';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/hooks/useUserId';

const STORAGE_KEY = 'snapwise-saved';

export interface SavedCardInfo {
  slug: string;
  title: string;
  emoji: string;
  category: string;
  savedAt: string;
}

interface SavedData {
  [slug: string]: SavedCardInfo;
}

function getSavedData(): SavedData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function useSaved(slug: string, card?: CardMeta) {
  const [saved, setSaved] = useState(false);
  const processingRef = useRef(false); // 연속 클릭 Race condition 방지

  useEffect(() => {
    setSaved(!!getSavedData()[slug]);
  }, [slug]);

  const toggleSave = useCallback(async () => {
    if (processingRef.current) return; // 연속 클릭 방지
    processingRef.current = true;

    try {
      const data = getSavedData();
      const userId = getUserId();

      if (data[slug]) {
        // 1. localStorage 즉시 삭제
        delete data[slug];
        setSaved(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // 2. Supabase 비동기 삭제 (fire-and-forget)
        if (supabase && userId) {
          supabase
            .from('card_saves')
            .delete()
            .eq('slug', slug)
            .eq('user_id', userId)
            .then(({ error }) => {
              if (error) {
                console.warn('[SnapWise] 저장 취소 Supabase 기록 실패:', error.message);
              }
            });
        }
      } else {
        const info: SavedCardInfo = {
          slug,
          title: card?.title || '',
          emoji: card?.emoji || '',
          category: card?.category || '',
          savedAt: new Date().toISOString(),
        };

        // 1. localStorage 즉시 저장
        data[slug] = info;
        setSaved(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // 2. Supabase 비동기 저장 (fire-and-forget)
        if (supabase && userId) {
          supabase
            .from('card_saves')
            .insert({ slug, user_id: userId })
            .then(({ error }) => {
              // 23505 = UNIQUE violation (중복 저장) → 정상 무시
              if (error && error.code !== '23505') {
                console.warn('[SnapWise] 저장 Supabase 기록 실패:', error.message);
              }
            });
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [slug, card]);

  return { saved, toggleSave };
}

export function getAllSavedCards(): SavedCardInfo[] {
  const data = getSavedData();
  return Object.values(data).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}
