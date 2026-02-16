'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CardMeta } from '@/types/content';

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

  useEffect(() => {
    setSaved(!!getSavedData()[slug]);
  }, [slug]);

  const toggleSave = useCallback(() => {
    const data = getSavedData();
    if (data[slug]) {
      delete data[slug];
      setSaved(false);
    } else {
      data[slug] = {
        slug,
        title: card?.title || '',
        emoji: card?.emoji || '',
        category: card?.category || '',
        savedAt: new Date().toISOString(),
      };
      setSaved(true);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [slug, card]);

  return { saved, toggleSave };
}

export function getAllSavedCards(): SavedCardInfo[] {
  const data = getSavedData();
  return Object.values(data).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}
