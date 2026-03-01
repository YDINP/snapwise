'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAnonymousId } from './useAnonymousId';

const SESSION_ID_KEY = 'snapwise-session-id';
const SESSION_START_KEY = 'snapwise-session-start';

/** 대시보드 경로면 세션 추적 건너뜀 */
const isDashboard = () =>
  typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');

/**
 * 유저 세션 추적 훅
 * - 마운트 시 세션 시작 (Supabase sessions 테이블 INSERT)
 * - visibilitychange='hidden' 또는 pagehide 시 세션 종료
 * - keepalive fetch 사용 → 페이지 언로드 시에도 요청 보장
 * - /dashboard 경로는 추적 제외
 * - usePathname()으로 마지막 방문 카드 slug를 reactive하게 추적
 *   → 카드 → 피드 이동 후 탭 닫기 시에도 정확한 exit_card_slug 기록
 */
export function useSessionTracker() {
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  /** 마지막으로 방문한 /card/[slug] 경로의 slug 값 */
  const lastCardSlugRef = useRef<string | null>(null);

  const pathname = usePathname();

  // pathname이 변경될 때마다 /card/[slug] 패턴이면 lastCardSlugRef 업데이트
  useEffect(() => {
    const match = pathname?.match(/^\/card\/([^/]+)\/?$/);
    if (match) {
      lastCardSlugRef.current = match[1];
    }
  }, [pathname]);

  const endSession = useCallback(() => {
    if (!sessionIdRef.current || !startTimeRef.current) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !supabaseKey) return;

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    // lastCardSlugRef: 이탈 시점 URL이 아닌 마지막 방문 카드 slug를 사용
    const exitCardSlug = lastCardSlugRef.current;

    // keepalive: true → 페이지 언로드 중에도 요청이 취소되지 않음
    fetch(`${supabaseUrl}/rest/v1/sessions?id=eq.${sessionIdRef.current}`, {
      method: 'PATCH',
      keepalive: true,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        exit_card_slug: exitCardSlug,
      }),
    }).catch(() => {/* 실패 시 무시 */});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const anonymousId = getAnonymousId();
    if (!anonymousId) return;

    const startSession = async () => {
      if (!supabase) return;
      if (isDashboard()) return; // 대시보드 세션 추적 제외

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
