-- SnapWise 세션 추적 마이그레이션
-- 생성일: 2026-03-01

-- ── sessions 테이블 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  card_slugs TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_sessions_anonymous_id ON sessions(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);

-- ── card_views 테이블 ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS card_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_views_slug ON card_views(slug);
CREATE INDEX IF NOT EXISTS idx_card_views_anonymous_id ON card_views(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_card_views_viewed_at ON card_views(viewed_at DESC);

-- ── RLS 정책 (anon 사용자 쓰기/읽기 허용) ─────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;

CREATE POLICY "anon_insert_sessions" ON sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_sessions" ON sessions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_sessions" ON sessions
  FOR SELECT TO anon USING (true);

ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_card_views" ON card_views;
DROP POLICY IF EXISTS "anon_select_card_views" ON card_views;

CREATE POLICY "anon_insert_card_views" ON card_views
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_card_views" ON card_views
  FOR SELECT TO anon USING (true);
