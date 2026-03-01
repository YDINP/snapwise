'use client';

import { useSessionTracker } from '@/hooks/useSessionTracker';

/**
 * 세션 추적 래퍼 컴포넌트
 * layout.tsx(Server Component)에서 분리된 Client Component
 * 자식 없이 훅만 실행하는 역할
 */
export default function SessionTrackerWrapper() {
  useSessionTracker();
  return null;
}
