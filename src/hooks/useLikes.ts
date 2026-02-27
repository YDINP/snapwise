'use client';

import { useState, useEffect, useCallback } from 'react';

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

  useEffect(() => {
    const data = getLikesData();
    const entry = data[slug];
    const isLiked = entry !== undefined && isLikedEntry(entry);
    setLiked(isLiked);
    setCount(getBaseCount(slug) + (isLiked ? 1 : 0));
  }, [slug]);

  const toggle = useCallback(() => {
    const data = getLikesData();
    const entry = data[slug];
    const isCurrentlyLiked = entry !== undefined && isLikedEntry(entry);
    if (isCurrentlyLiked) {
      delete data[slug];
    } else {
      data[slug] = { likedAt: new Date().toISOString() };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const isNowLiked = !!data[slug];
    setLiked(isNowLiked);
    setCount(getBaseCount(slug) + (isNowLiked ? 1 : 0));
  }, [slug]);

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
