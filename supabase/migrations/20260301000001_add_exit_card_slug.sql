-- SnapWise 세션 이탈 카드 추적 마이그레이션
-- 생성일: 2026-03-01
-- sessions 테이블에 exit_card_slug 컬럼 추가

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS exit_card_slug TEXT;

COMMENT ON COLUMN sessions.exit_card_slug IS '유저 이탈 시 마지막으로 보고 있던 카드 slug (카드 외 페이지에서 이탈 시 NULL)';
