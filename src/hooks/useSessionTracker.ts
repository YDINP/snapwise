'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getAnonymousId } from './useAnonymousId';

const SESSION_ID_KEY = 'snapwise-session-id';
const SESSION_START_KEY = 'snapwise-session-start';

/**
 * 유저 세션 추적 훅
 * - 마운트 시 세션 시작 (Supabase sessions 테이블 INSERT)
 * - visibilitychange='hidden' 또는 beforeunload 시 세션 종료 (UPDATE duration_seconds)
 * - Supabase 연결 없으면 조용히 실패
 */
export function useSessionTracker() {
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * 현재 URL pathname에서 카드 slug 추출
   * /card/[slug] 패턴에 해당하면 slug 반환, 그 외 null 반환
   */
  const getCurrentCardSlug = (): string | null => {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/^\/card\/([^/]+)\/?$/);
    return match ? match[1] : null;
  };

  const endSession = useCallback(async () => {
    if (!supabase || !sessionIdRef.current || !startTimeRef.current) return;

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const endedAt = new Date().toISOString();
    const exitCardSlug = getCurrentCardSlug();

    try {
      const updatePayload: {
        ended_at: string;
        duration_seconds: number;
        exit_card_slug?: string | null;
      } = {
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        exit_card_slug: exitCardSlug,
      };

      const { error } = await supabase
        .from('sessions')
        .update(updatePayload)
        .eq('id', sessionIdRef.current);

      if (error) {
        console.warn('[SnapWise] 세션 종료 기록 실패:', error.message);
      }
    } catch (err) {
      console.warn('[SnapWise] 세션 종료 기록 실패:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const anonymousId = getAnonymousId();
    if (!anonymousId) return;

    const startSession = async () => {
      if (!supabase) return;

      startTimeRef.current = Date.now();

      try {
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            anonymous_id: anonymousId,
            started_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) {
          console.warn('[SnapWise] 세션 시작 기록 실패:', error.message);
          return;
        }

        if (data?.id) {
          sessionIdRef.current = data.id;
          try {
            sessionStorage.setItem(SESSION_ID_KEY, data.id);
            sessionStorage.setItem(SESSION_START_KEY, String(startTimeRef.current));
          } catch {
            // sessionStorage 접근 불가 환경 무시
          }
        }
      } catch (err) {
        console.warn('[SnapWise] 세션 시작 오류:', err);
      }
    };

    startSession();

    // visibilitychange: 탭 전환/닫기 감지
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      }
    };

    // pagehide: 모바일에서 beforeunload 대신 사용
    const handlePageHide = () => {
      endSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [endSession]);

  return { sessionId: sessionIdRef };
}
