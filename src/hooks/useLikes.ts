'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'snapwise-likes';

interface LikesData {
  [slug: string]: boolean;
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

export function useLikes(slug: string) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const isLiked = !!getLikesData()[slug];
    setLiked(isLiked);
    setCount(getBaseCount(slug) + (isLiked ? 1 : 0));
  }, [slug]);

  const toggle = useCallback(() => {
    const data = getLikesData();
    data[slug] = !data[slug];
    if (!data[slug]) delete data[slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const isLiked = !!data[slug];
    setLiked(isLiked);
    setCount(getBaseCount(slug) + (isLiked ? 1 : 0));
  }, [slug]);

  return { liked, toggle, count };
}
