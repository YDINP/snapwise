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

export function useLikes(slug: string) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(!!getLikesData()[slug]);
  }, [slug]);

  const toggle = useCallback(() => {
    const data = getLikesData();
    data[slug] = !data[slug];
    if (!data[slug]) delete data[slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLiked(!!data[slug]);
  }, [slug]);

  // Total likes count across all cards (for display)
  const getLikeCount = useCallback(() => {
    return getLikesData()[slug] ? 1 : 0;
  }, [slug]);

  return { liked, toggle, getLikeCount };
}
