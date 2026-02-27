'use client';

import { useState, useEffect } from 'react';

const USER_ID_KEY = 'snapwise-user-id';

/** 브라우저에서 익명 사용자 ID를 생성/조회하는 SSOT 훅 */
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let id = localStorage.getItem(USER_ID_KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(USER_ID_KEY, id);
      }
      setUserId(id);
    } catch {
      // localStorage 비활성화 환경 (SSR 등) — null 유지
    }
  }, []);

  return userId;
}

/** 훅 없이 직접 user_id를 가져올 때 사용 (훅 컨텍스트 밖) */
export function getUserId(): string | null {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
