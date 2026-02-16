# SnapWise v3.0 — 예상 이슈 케이스 시나리오

## 1. 파서(Parser) 관련 이슈

### 1.1 dialogue:characterId 파싱 실패
**시나리오**: `<!-- step:dialogue:einstein -->` 에서 characterId가 빈 문자열로 파싱됨
**원인**: regex가 `:` 구분자를 잘못 분할
**영향**: DialogueStep에 캐릭터 아바타 미표시
**해결**: parseSteps의 `rawType.split(':')` 로직 + fallback default 캐릭터

### 1.2 v2/v3 혼합 카드
**시나리오**: 하나의 MDX에 v2 step(`hook`)과 v3 step(`cinematic-hook`) 혼재
**원인**: 마이그레이션 중 부분 변환
**영향**: isCinematic 플래그는 true가 되지만, v2 스텝은 CinematicRenderer에서 처리 불가
**해결**: CinematicRenderer에 v2 타입 폴백 추가 (v2 → 가장 유사한 v3 컴포넌트로 매핑)

### 1.3 step 마커 없는 MDX
**시나리오**: content/ 폴더에 step 마커 없는 v1 MDX가 남아있음
**원인**: v1 → v3 마이그레이션 누락
**영향**: parseSteps가 자동 3스텝 분할 (v1 폴백) → isCinematic = false
**해결**: 정상 동작 (StepRenderer v2 경로로 렌더링). 마이그레이션 필요 카드 로그 출력

## 2. 컴포넌트 관련 이슈

### 2.1 DialogueBubble 텍스트 오버플로우
**시나리오**: 대사가 3줄 이상으로 말풍선이 화면 밖으로 넘침
**원인**: 80자 제한 미준수 콘텐츠
**영향**: 모바일에서 스크롤 불가능한 오버플로우
**해결**: `max-h-[40vh] overflow-y-auto` 또는 콘텐츠 린트 스크립트

### 2.2 CharacterAvatar 이모지 렌더링 차이
**시나리오**: Windows/macOS/Android에서 이모지 디자인이 다름
**원인**: OS별 이모지 글꼴 차이
**영향**: 캐릭터 일관성 문제 (같은 👨‍🔬가 다르게 보임)
**해결**: 현재는 허용 (Phase 2에서 SVG 커스텀 캐릭터로 전환 예정)

### 2.3 StepImage 로딩 지연
**시나리오**: Pexels 이미지가 느리게 로드되어 빈 배경 노출
**원인**: 네트워크 지연 또는 이미지 미다운로드
**영향**: 카드 전환 시 깜빡임, UX 저하
**해결**:
1. 빌드 타임에 이미지 다운로드 (SSG)
2. next/image의 blur placeholder 활용
3. 카테고리 그라디언트 즉시 폴백

### 2.4 CinematicRenderer switch 누락
**시나리오**: 새 StepType 추가 시 CinematicRenderer case 누락
**원인**: StepType union 확장 시 switch문 미업데이트
**영향**: 해당 스텝이 렌더링되지 않거나 빈 화면
**해결**: default case에서 NarrationStep 폴백 + TypeScript exhaustiveness check

## 3. 콘텐츠 관련 이슈

### 3.1 80자 제한 초과
**시나리오**: 리라이트된 MDX에서 한 스텝이 80자를 초과
**원인**: 작성자 실수 또는 자동 생성 오류
**영향**: 모바일에서 텍스트가 너무 많아 읽기 어려움
**해결**: 빌드 타임 린트 스크립트 (`scripts/lint-content.ts`)

### 3.2 characters frontmatter 누락
**시나리오**: dialogue 스텝이 있는데 characters 배열이 frontmatter에 없음
**원인**: MDX 작성 시 frontmatter 누락
**영향**: DialogueStep에서 characterId로 캐릭터 조회 실패 → 기본 이모지
**해결**: fallback 캐릭터 ({ id: 'unknown', name: '화자', emoji: '💬' })

### 3.3 reveal-title 스텝 누락
**시나리오**: 카드에 reveal-title 없이 바로 outro로 끝남
**원인**: 콘텐츠 구조 실수
**영향**: 타이틀 공개 없이 카드 종료 → 핵심 UX 손상
**해결**: 빌드 타임 검증 — reveal-title 누락 시 warning 출력

### 3.4 이미지 검색어 부적절
**시나리오**: Pexels에서 "양자 얽힘" 검색 → 관련 없는 사진 반환
**원인**: 한국어 키워드 Pexels 지원 미흡
**영향**: 카드 분위기와 맞지 않는 배경 이미지
**해결**: 이미지 키워드는 반드시 **영어**로 지정 (예: "quantum physics laboratory")

## 4. 빌드/배포 관련 이슈

### 4.1 Worktree 머지 충돌
**시나리오**: 여러 브랜치에서 같은 파일 수정 → 머지 시 충돌
**가능한 충돌 파일**:
- `src/types/content.ts` (TASK-1 + TASK-2에서 import)
- `src/app/globals.css` (TASK-3에서 추가)
- `package.json` (TASK-4에서 scripts 추가)
**해결**: TASK-8 통합 단계에서 순차 머지 + 수동 충돌 해결

### 4.2 next/image 외부 도메인
**시나리오**: Pexels 이미지를 직접 URL로 사용 시 next/image 도메인 미등록
**원인**: next.config.mjs에 images.remotePatterns 미설정
**영향**: 빌드 에러 또는 런타임 에러
**해결**: `next.config.mjs`에 pexels.com 도메인 추가 (또는 로컬 이미지만 사용)

### 4.3 정적 페이지 수 증가
**시나리오**: 30카드 × 15스텝 = 비례적 빌드 시간 증가 (실제로는 아님)
**원인**: 오해 — 스텝은 클라이언트 사이드 전환이므로 정적 페이지 수는 동일
**영향**: 없음 (41페이지 그대로 유지)

### 4.4 Vercel 빌드 타임아웃
**시나리오**: 이미지 다운로드 포함 빌드 시 45초 제한 초과
**원인**: Pexels API 호출이 빌드 타임에 포함
**영향**: Vercel 빌드 실패
**해결**: 이미지는 별도 스크립트로 사전 다운로드 (`npm run fetch-images`), 빌드는 로컬 파일만 참조

## 5. 성능 관련 이슈

### 5.1 이미지 번들 사이즈
**시나리오**: 30카드 × 10이미지 = 300개 이미지 → 배포 사이즈 급증
**원인**: 모든 이미지를 public/에 포함
**영향**: 초기 배포 시간 증가, 저장소 bloat
**해결**:
1. 이미지를 .gitignore에 추가
2. CDN (Vercel) 이미지 최적화 활용
3. MVP에서는 카테고리 그라디언트만 사용, 이미지는 선택적

### 5.2 15스텝 카드의 진행바 UX
**시나리오**: 15개 세그먼트가 너무 좁아서 탭 불가능
**원인**: Instagram Stories 진행바는 최대 ~10개에 최적화
**영향**: 진행바가 시각적으로 구분 안 됨
**해결**:
1. 세그먼트 최소 너비 2px 보장
2. 10개 이상이면 진행바 높이 감소 (4px → 2px)
3. 또는 도트 인디케이터로 전환

### 5.3 Framer Motion 번들 사이즈
**시나리오**: 7개 새 컴포넌트 × motion 사용 → JS 번들 증가
**원인**: motion/react 라이브러리가 각 컴포넌트에 포함
**영향**: First Load JS 증가 (현재 ~102KB)
**해결**:
1. motion은 이미 tree-shakeable
2. 동적 import로 cinematic 컴포넌트 지연 로딩
3. 목표: First Load JS < 150KB

## 6. UX 관련 이슈

### 6.1 스텝 진행 방향 혼란
**시나리오**: 사용자가 "다음 카드"와 "다음 스텝"을 혼동
**원인**: 세로 스와이프(다음 카드) vs 탭(다음 스텝) 구분 불명확
**영향**: 의도치 않게 카드를 건너뜀
**해결**:
1. 첫 방문 시 스와이프 가이드 오버레이
2. 카드 하단에 "탭하여 계속" 인디케이터 강화
3. 스텝 전환 시 미세 진동 (navigator.vibrate)

### 6.2 타이틀 라스트의 SEO 영향
**시나리오**: 검색 엔진이 카드 제목을 못 찾음 (UI에서 마지막에만 노출)
**원인**: 콘텐츠 첫 부분에 제목 미노출
**영향**: SEO 점수 하락 가능
**해결**:
1. HTML head에는 title/description 정상 포함 (서버 사이드)
2. UI 렌더링에서만 타이틀 라스트 적용
3. JSON-LD Article schema에 title 포함

### 6.3 긴 카드의 이탈률
**시나리오**: 15스텝 카드에서 중간에 이탈 (5-6스텝 후)
**원인**: 콘텐츠 길이 대비 흥미 유지 실패
**영향**: 완독률 저하
**해결**:
1. 중간에 impact 스텝으로 서스펜스 유지
2. 카드당 최적 스텝 수: 8-12 (15는 예외적)
3. 진행률 표시 강화 ("3/10")

## 7. 종속성(Dependency) 관련 이슈

### 7.1 TASK-2가 TASK-1 미완료 시 시작
**시나리오**: types/content.ts 변경 전에 cinematic 컴포넌트 작성
**원인**: 병렬 실행 시 종속성 무시
**영향**: import 에러, 빌드 실패
**해결**: TaskList blockedBy 엄격 관리 + 빌드 시 tsc --noEmit 선검증

### 7.2 globals.css 머지 충돌
**시나리오**: TASK-3 (UI 스타일) + TASK-8 (통합) 양쪽에서 globals.css 수정
**원인**: 같은 파일 다른 위치 수정
**영향**: 머지 충돌
**해결**: TASK-3에서만 globals.css 수정, TASK-8에서는 건드리지 않음

### 7.3 콘텐츠 태스크 간 스타일 불일치
**시나리오**: TASK-5(과학)는 8스텝, TASK-6(IT)는 15스텝 → 일관성 부족
**원인**: 서로 다른 에이전트가 독립적으로 작성
**영향**: 카테고리별 UX 차이
**해결**: 콘텐츠 가이드라인 명확화 (8-12스텝 권장, 15 이하)

## 대응 우선순위

| 우선순위 | 이슈 | 예방 방법 |
|---------|------|----------|
| P0 | 7.1 종속성 순서 | blockedBy 엄격 관리 |
| P0 | 4.1 머지 충돌 | 순차 머지 + 사전 리뷰 |
| P0 | 2.4 Renderer 폴백 | default case 필수 |
| P1 | 1.2 v2/v3 혼합 | CinematicRenderer 폴백 |
| P1 | 3.1 80자 초과 | 빌드 타임 린트 |
| P1 | 5.2 진행바 UX | 세그먼트 최소 너비 |
| P2 | 3.4 이미지 키워드 | 영어 필수 가이드라인 |
| P2 | 5.1 이미지 사이즈 | .gitignore + CDN |
| P3 | 6.3 이탈률 | 콘텐츠 품질 관리 |
