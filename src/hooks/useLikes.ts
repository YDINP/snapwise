'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/hooks/useUserId';

const STORAGE_KEY = 'snapwise-likes';

interface LikeEntry {
  likedAt: string;
}

/** 하위 호환: 기존 boolean 또는 신규 LikeEntry */
interface LikesData {
  [slug: string]: LikeEntry | boolean;
}

export interface LikedCardInfo {
  slug: string;
  likedAt: string;
}

function getLikesData(): LikesData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Deterministic pseudo-count per slug (12–89 range) for social proof */
function getBaseCount(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return 12 + Math.abs(hash % 78);
}

function isLikedEntry(v: LikeEntry | boolean): boolean {
  return v === true || (typeof v === 'object' && v !== null);
}

export function useLikes(slug: string) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [processing, setProcessing] = useState(false); // 연속 클릭 Race condition 방지

  useEffect(() => {
    const data = getLikesData();
    const entry = data[slug];
    const isLiked = entry !== undefined && isLikedEntry(entry);
    setLiked(isLiked);
    setCount(getBaseCount(slug) + (isLiked ? 1 : 0));
  }, [slug]);

  const toggle = useCallback(async () => {
    if (processing) return; // 연속 클릭 방지
    setProcessing(true);

    try {
      const data = getLikesData();
      const entry = data[slug];
      const isCurrentlyLiked = entry !== undefined && isLikedEntry(entry);

      // 1. localStorage 즉시 업데이트 (낙관적 UI)
      if (isCurrentlyLiked) {
        delete data[slug];
      } else {
        data[slug] = { likedAt: new Date().toISOString() };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const isNowLiked = !!data[slug];
      setLiked(isNowLiked);
      setCount(getBaseCount(slug) + (isNowLiked ? 1 : 0));

      // 2. Supabase 비동기 fire-and-forget (실패해도 localStorage 상태 유지)
      const userId = getUserId();
      if (supabase && userId) {
        if (isNowLiked) {
          supabase
            .from('card_likes')
            .insert({ slug, user_id: userId })
            .then(({ error }) => {
              // 23505 = UNIQUE violation (중복 좋아요) → 정상 무시
              if (error && error.code !== '23505') {
                console.warn('[SnapWise] 좋아요 Supabase 기록 실패:', error.message);
              }
            });
        } else {
          supabase
            .from('card_likes')
            .delete()
            .eq('slug', slug)
            .eq('user_id', userId)
            .then(({ error }) => {
              if (error) {
                console.warn('[SnapWise] 좋아요 취소 Supabase 기록 실패:', error.message);
              }
            });
        }
      }
    } finally {
      setProcessing(false);
    }
  }, [slug, processing]);

  return { liked, toggle, count };
}

export function getAllLikedCards(): LikedCardInfo[] {
  const data = getLikesData();
  return Object.entries(data)
    .filter(([, v]) => v !== undefined && isLikedEntry(v))
    .map(([slug, v]) => ({
      slug,
      likedAt:
        typeof v === 'object' ? (v as LikeEntry).likedAt : new Date(0).toISOString(),
    }))
    .sort((a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime());
}
