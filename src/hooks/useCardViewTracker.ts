'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getAnonymousId } from './useAnonymousId';

/**
 * 카드 조회 추적 훅
 * - slug가 변경될 때마다 card_views 테이블에 INSERT
 * - Supabase 연결 없으면 조용히 실패
 */
export function useCardViewTracker(slug: string) {
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!slug || trackedRef.current.has(slug)) return;

    const trackView = async () => {
      if (!supabase) return;

      const anonymousId = getAnonymousId();
      if (!anonymousId) return;

      try {
        trackedRef.current.add(slug);

        await supabase.from('card_views').insert({
          anonymous_id: anonymousId,
          slug,
          viewed_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[SnapWise] 카드 조회 기록 실패:', err);
        // 실패 시 Set에서 제거하여 재시도 가능하게 함
        trackedRef.current.delete(slug);
      }
    };

    trackView();
  }, [slug]);
}
