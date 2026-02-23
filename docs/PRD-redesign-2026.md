# SnapWise 2026 전체 개편 PRD

> 브랜치: `feat/redesign-2026`
> 작성일: 2026-02-23
> 작성: Consensus 멀티 에이전트 분석 (architect + planner + qa-tester)
> 합의 방식: 3/3 LAYERED 일치

---

## 1. 개편 배경 및 목표

### 배경

SnapWise는 Next.js 15 / React 19 / Tailwind CSS 4 / MDX 기반 숏폼 지식 블로그다.
현재 310개 MDX 카드, 25종 스텝 타입, 11개 카테고리를 보유한 성숙한 콘텐츠 플랫폼이지만
아래 구조적 문제와 UX 공백이 개편을 필요로 한다.

### 핵심 문제

| 영역 | 문제 | 심각도 |
|------|------|------|
| **UX** | 첫 방문자 조작 가이드 완전 부재 (탭/스와이프/스크롤 3중 체계 설명 없음) | P0 |
| **기술** | IntersectionObserver + motion 이중 제어 (scroll-snap 전환 시 index 갱신 충돌) | P0 |
| **접근성** | prefers-reduced-motion 전혀 미적용 (CSS 키프레임 6종 + motion 전체 미대응) | P1 |
| **성능** | `getAllCards()` 3회 중복 호출 (빌드 시 전체 MDX 반복 파싱) | P1 |
| **코드 품질** | `parseInlineAccent` 동일 로직 3개소 중복 | P2 |
| **코드 품질** | `MangaSceneStep.tsx` 1324줄 모노리스 (파싱+렌더링+애니메이션 혼재) | P2 |
| **데이터** | localStorage 4개 스토어 분산 + 네임스페이스 불일치 | P2 |
| **미활용** | `@splinetool/react-spline` 설치됨 (소스 코드에 단 한 번도 import 없음, 번들 낭비) | P2 |
| **기능 부재** | 랜딩/온보딩, 카드 추천, 시리즈 네비게이션 (필드는 이미 CardMeta에 존재) | P3 |

### 개편 목표

1. **경험**: 첫 방문자가 5초 내에 앱의 가치를 이해하고 카드 소비를 시작할 수 있다
2. **몰입**: 각 스텝 전환이 시각적으로 차별화된 motion으로 연출된다
3. **성능**: Lighthouse 모바일 95+, 빌드 시 중복 파싱 제거
4. **기술 건전성**: 레이어별 책임 분리, 중복 코드 제거, 접근성 기준 충족

---

## 2. 현재 아키텍처 분석

### 2.1 컴포넌트 계층 및 데이터 흐름

```
[MDX 파일 310개] → content.ts::getAllCards() → CardMeta[]
                          ↓
           app/page.tsx (Server Component)
                          ↓
           CardFeed (Client)
                ├─ IntersectionObserver (현재 카드 감지)
                ├─ Wheel/Keyboard/Touch 이벤트
                └─ StoryCard (카드 컨테이너)
                      ├─ useStepNavigation (localStorage: snapwise-progress)
                      ├─ StepProgressBar
                      └─ AnimatePresence
                            ├─ CinematicRenderer [isCinematic=true] — 16종 v3 스텝
                            │     └─ OutroStep → useLikes, useSaved
                            └─ StepRenderer [isCinematic=false] — v2 fallback
```

### 2.2 유지할 구조

| 항목 | 이유 |
|------|------|
| `CardStep` + `isCinematic` 플래그 분기 | 310개 MDX 하위호환 필수 |
| `getCategoryInfo()` 컬러 토큰 시스템 | 전 cinematic 컴포넌트의 색상 기반 |
| `useStepNavigation` localStorage 진행 저장 | 핵심 UX 기능 |
| `AnimatePresence` + motion 스텝 전환 | 현재 가장 잘 동작하는 부분 |
| `CinematicRenderer` switch-case 분기 구조 | 신규 타입 추가에 확장 친화적 |

### 2.3 카테고리 목록 (SSOT 확정)

> ⚠️ `types/content.ts`의 `CategoryKey`에 `koreanhistory`, `tmi`가 존재하나
> `CLAUDE.md`에는 미등재. 개편 시 공식 목록 통일 필요.

| key | label |
|-----|-------|
| science | 과학 |
| psychology | 심리 |
| people | 인물 |
| history | 역사 |
| life | 라이프 |
| business | 비즈니스 |
| culture | 문화 |
| origins | 어원 |
| etc | 상식 |
| koreanhistory | 한국사 *(공식화)* |
| tmi | TMI *(공식화)* |

---

## 3. 기술 아키텍처 결정사항

### 결정 1: Content 레이어 강화

**문제**: `getAllCards()`가 빌드 시 3회 중복 호출 + 파서 로직이 컴포넌트 내부에 산재

**결정**:
- `React.cache()`로 `getAllCards()` 빌드 내 단일 파싱
- 컴포넌트 내 파서 함수를 `src/lib/parsers/`로 분리
  - `parsers/stat.ts` ← StatStep의 parseStatContent
  - `parsers/vs.ts` ← VsStep의 parseVsContent
  - `parsers/manga.ts` ← MangaSceneStep의 parseMangaPanel
  - `parsers/showcase.ts` ← ShowcaseStep의 parseShowcase
- `parseInlineAccent` / `parseInlineBold` 중복 3개소 → `lib/renderContent.ts` 단일 함수로 통합

### 결정 2: 피드 인덱스 갱신 방식 전환

**문제**: IntersectionObserver(threshold 0.6) + scrollTo + 800ms timeout 잠금이 motion 전환과 충돌

**결정**:
- 카드 전환을 motion의 `onAnimationComplete` 콜백 기반으로 변경
- `isScrollingRef` + setTimeout 방식 제거
- CSS `scroll-snap`은 보조 역할로 유지 (터치 스크롤 UX)

### 결정 3: Spline 활용 전략

**문제**: `@splinetool/react-spline` 설치만 되고 미사용 (번들 낭비)

**결정**:
- 현재 패키지는 유지 (이미 설치됨)
- 랜딩 히어로 배경에 단계적 도입
- 필수 안전장치:
  ```ts
  // Spline 사용 조건: 고사양 기기 + 모션 허용
  const canUseSpline = navigator.deviceMemory >= 4
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ```
- 조건 미충족 시: CSS gradient 정적 배경으로 fallback
- `next/dynamic({ ssr: false })` 필수

### 결정 4: prefers-reduced-motion 전면 대응

**문제**: CSS 키프레임 6종(`reveal-glow`, `speaking-pulse` 등) + motion 전체가 접근성 설정 무시

**결정**:
- `globals.css`에 `@media (prefers-reduced-motion: reduce)` 블록 추가
- motion에 `useReducedMotion()` 훅 적용 (duration → 0, opacity-only 전환)

### 결정 5: localStorage 스토어 정리

**문제**: 4개 스토어가 각기 다른 키 명칭으로 분산 (`snapwise_seen` vs `snapwise-progress` 등)

**결정 (경량화)**:
- 네임스페이스 통일 (`snapwise-*` 형식으로 통일)
- 기존 훅 구조 유지, 키 이름만 정리 (하위호환 마이그레이션 로직 추가)
- 완전 통합 리팩토링은 Phase 2로 연기 (현재 개편 범위 밖)

---

## 4. TASK 세분화

### 영역 1: 홈 피드 (Home Feed)
**현재**: scroll-snap + IntersectionObserver 피드. 첫인상 설계 없음
**목표**: 피드 진입 경험 개선 + 첫 카드 stagger 애니메이션
**우선순위**: HIGH

| ID | 태스크 | 담당 에이전트 | 파일 |
|----|--------|-------------|------|
| T1.1 | 카드 목록 첫 진입 stagger fadeInUp 애니메이션 | designer | `feed/CardFeed.tsx` |
| T1.2 | 로딩 스켈레톤 → motion shimmer 교체 | designer | `feed/CardFeed.tsx`, `ui/Skeleton.tsx`(신규) |
| T1.3 | 빈 피드 EmptyFeed 컴포넌트 추가 | designer | `feed/EmptyFeed.tsx`(신규) |
| T1.4 | StoryCard 카드 전환 motion 강화 (y:4→y:20, 이징 개선) | designer | `feed/StoryCard.tsx` |
| T1.5 | AdPopup motion 진입/퇴장 애니메이션 | designer | `feed/AdPopup.tsx` |

**의존성**: T6.1(motionVariants) 완료 후 병렬 진행 가능

---

### 영역 2: 시네마틱 카드 뷰어 (Card Viewer)
**현재**: 16종 스텝 타입, 스텝 전환은 AnimatePresence crossfade(0.15s), 스텝 내부 진입 애니메이션 미비
**목표**: 스텝 타입별 고유 진입 애니메이션 + CSS 키프레임 → motion 통합
**우선순위**: HIGH

| ID | 태스크 | 담당 에이전트 | 파일 |
|----|--------|-------------|------|
| T2.1 | 스텝 전환 트랜지션 고도화 (스텝 타입별 방향성 부여) | designer | `feed/StoryCard.tsx` |
| T2.2 | CinematicHook 타이틀 stagger reveal 애니메이션 | designer | `cinematic/CinematicHook.tsx` |
| T2.3 | ImpactStep motion scale + glow 트랜지션 | designer | `cinematic/ImpactStep.tsx` |
| T2.4 | RevealTitleStep scale(0.8→1) + opacity motion | designer | `cinematic/RevealTitleStep.tsx` |
| T2.5 | DialogueStep 말풍선 slideIn 진입 애니메이션 | designer | `cinematic/DialogueStep.tsx` |
| T2.6 | StatStep 숫자 카운트업 (motion useMotionValue) | executor | `cinematic/StatStep.tsx` |
| T2.7 | OutroStep 다음 카드 프리뷰 진입 강화 | designer | `cinematic/OutroStep.tsx` |
| T2.8 | 스텝 0 경계 피드백 — shake 애니메이션 | executor | `hooks/useStepNavigation.ts` |
| T2.9 | globals.css CSS 키프레임 → motion variant 전환 | executor | `app/globals.css`, 영향 컴포넌트 |

**의존성**: T2.1 완료 후 T2.2~T2.7 병렬 진행. T6.1 선행 권장

---

### 영역 3: 카테고리 탐색 (Category Navigation)
**현재**: 가로 스크롤 pill, motion spring 선택 애니메이션. 활성 pill 자동 스크롤 없음
**목표**: CategoryBar UX 개선 + 페이지 전환 트랜지션
**우선순위**: MED

| ID | 태스크 | 담당 에이전트 | 파일 |
|----|--------|-------------|------|
| T3.1 | CategoryBar 마운트 시 pill stagger 진입 | designer | `navigation/CategoryBar.tsx` |
| T3.2 | 활성 pill 자동 center-scroll (scrollIntoView) | executor | `navigation/CategoryBar.tsx` |
| T3.3 | 카테고리 페이지 진입 트랜지션 (page-level motion) | designer | `app/category/[category]/page.tsx` |
| T3.4 | /saved 페이지 진입 트랜지션 | designer | `app/saved/page.tsx` |

**의존성**: T3.1, T3.2 병렬 진행 가능

---

### 영역 4: 랜딩/온보딩 (Landing & Onboarding)
**현재**: 완전 부재. 첫 방문자가 바로 피드에 노출됨
**목표**: 첫 방문 히어로 섹션 + 조작 가이드 오버레이
**우선순위**: MED (신규 기능, 기존 UX에 영향 없음)

| ID | 태스크 | 담당 에이전트 | 파일 |
|----|--------|-------------|------|
| T4.1 | useFirstVisit 훅 구현 (localStorage 플래그) | executor | `hooks/useFirstVisit.ts`(신규) |
| T4.2 | HeroSection 컴포넌트 — 앱 소개 + CTA + motion 타이포그래피 | designer | `landing/HeroSection.tsx`(신규) |
| T4.3 | SplineBackground 컴포넌트 — 3D 배경 + fallback | designer | `landing/SplineBackground.tsx`(신규) |
| T4.4 | 히어로 → 피드 전환 애니메이션 (CTA 클릭) | designer | `landing/HeroSection.tsx`, `app/page.tsx` |
| T4.5 | page.tsx 조건부 렌더링 통합 (첫 방문=Hero, 재방문=Feed) | executor | `app/page.tsx` |
| T4.6 | 첫 카드 조작 가이드 오버레이 (탭/스와이프 힌트) | designer | `landing/GestureGuide.tsx`(신규) |

**의존성**: T4.1 → T4.2+T4.3 병렬 → T4.4 → T4.5. T4.3은 T6.2(Spline lazy load)와 함께

---

### 영역 5: 대시보드 (Dashboard)
**현재**: 3탭(개요/카테고리/내 활동), 탭 전환 motion 없음, 인기점수 가짜 해시
**목표**: 탭 전환 motion + 실데이터 연동 + 시각적 개선
**우선순위**: MED

| ID | 태스크 | 담당 에이전트 | 파일 |
|----|--------|-------------|------|
| T5.1 | 탭 전환 AnimatePresence fade 추가 | designer | `dashboard/DashboardTabs.tsx` |
| T5.2 | useSeenCards 데이터 → MyActivity 실연동 | executor | `dashboard/MyActivity.tsx` |
| T5.3 | 개요 탭 스탯 카드 카운트업 + stagger 진입 | designer | `dashboard/DashboardTabs.tsx` |
| T5.4 | 카테고리 바 차트 animate(0→barWidth) | designer | `dashboard/DashboardTabs.tsx` |
| T5.5 | 대시보드 진입 링크 CategoryBar에 추가 | executor | `navigation/CategoryBar.tsx` |

**의존성**: T5.1, T5.3, T5.4 병렬. T5.2는 useSeenCards 인터페이스 확인 후

---

### 영역 6: 성능 & 기술 개선 (Performance & Tech)
**현재**: motion 미활용 영역 다수, Spline 미사용, CSS/motion 혼용, img 태그 미최적화
**목표**: 기술 부채 해소 + 성능 회귀 방지
**우선순위**: HIGH (T6.1은 타 영역 선행 필수)

| ID | 태스크 | 담당 에이전트 | 파일 |
|----|--------|-------------|------|
| T6.1 | **[선행]** motion 공통 variant 파일 생성 (`fadeInUp`, `stagger`, `scaleIn`, `slideInLeft`) | executor | `lib/motionVariants.ts`(신규) |
| T6.2 | Spline dynamic import + Suspense 패턴 수립 | executor | `landing/SplineBackground.tsx` |
| T6.3 | `getAllCards()` React.cache() 캐싱 적용 | executor | `lib/content.ts` |
| T6.4 | parseInlineAccent 중복 3개소 → renderContent.ts 통합 | executor | `lib/renderContent.tsx`, `cinematic/ImpactStep.tsx`, `cinematic/MangaSceneStep.tsx` |
| T6.5 | `<img>` → `<Image>` 교체 (RevealTitleStep, DialogueStep 등) | executor | `cinematic/RevealTitleStep.tsx`, `cinematic/DialogueStep.tsx` |
| T6.6 | prefers-reduced-motion 전역 대응 (globals.css + motion) | executor | `app/globals.css` |
| T6.7 | localStorage 키 네임스페이스 통일 + 마이그레이션 로직 | executor | `hooks/useLikes.ts`, `hooks/useSaved.ts`, `hooks/useSeenCards.ts` |
| T6.8 | 컴포넌트 내 파서 함수 `lib/parsers/` 분리 | executor | `lib/parsers/` (신규 디렉토리) |

**의존성**: T6.1 → 모든 영역 시작 전 완료 필수. T6.3은 독립. T6.4는 T6.8과 함께

---

## 5. 위험 요소 및 방어 전략

### P0 위험 (즉시 방어 필수)

| 위험 | 발생 지점 | 방어 전략 |
|------|---------|---------|
| IntersectionObserver + motion 이중 제어 | `CardFeed.tsx` | motion `onAnimationComplete` 콜백으로 index 갱신, setTimeout 제거 |
| Spline 모바일 크래시 (iOS WebGL 256MB 한계) | `SplineBackground.tsx` | `deviceMemory < 4` + `prefers-reduced-motion` 감지 후 CSS fallback |

### P1 위험 (개편 초기에 처리)

| 위험 | 발생 지점 | 방어 전략 |
|------|---------|---------|
| prefers-reduced-motion 미대응 | CSS 키프레임 6종, motion 전체 | `globals.css @media` 블록 + `useReducedMotion()` 훅 |
| AnimatePresence `mode="popLayout"` 레이아웃 점프 | `StoryCard.tsx` → 25종 스텝 | `mode="wait"` 전환 또는 모든 스텝에 `position: absolute; inset: 0` |
| MDX 빌드 선형 증가 (310개+) | `lib/content.ts` | `React.cache()` (T6.3) |
| RSC/localStorage 경계 충돌 | 훅 4개 | `typeof window !== 'undefined'` 가드 일관 적용 |
| Tailwind CSS 4 @theme vs 커스텀 CSS 변수 충돌 | `globals.css` | 개편 초기에 커스텀 변수를 Tailwind 4 `@theme` 블록으로 마이그레이션 |

### P2 위험 (모니터링)

| 위험 | 방어 방향 |
|------|---------|
| OutroStep `koreanhistory` 하드코딩 예외 처리 | `getCategoryInfo()` 기반 범용 처리로 교체 |
| 좋아요 카운트 가짜 해시 | 표시 제거 또는 서버 연동 (현재 범위 밖) |
| AdPopup과 카드 전환 타이밍 경합 | currentIndex 기반 조건부 렌더링으로 setTimeout 제거 |

---

## 6. 실행 계획

### 크리티컬 패스

```
T6.1 (motionVariants 수립)
  ↓
  ├─ T6.3 (getAllCards 캐싱)       — 독립 실행 가능
  ├─ T6.6 (prefers-reduced-motion) — 독립 실행 가능
  ↓
영역 1 + 영역 2 + 영역 3 병렬
  ↓
T4.1 (useFirstVisit 훅)
  ↓
T4.2 + T4.3 병렬 (HeroSection + SplineBackground)
  ↓
T4.4 + T4.5 (히어로 전환 + page.tsx 통합)
  ↓
영역 5 (Dashboard)
  ↓
T6.4 + T6.5 + T6.7 + T6.8 (기술 부채 정리)
  ↓
최종 검증 (빌드 + Lighthouse + 접근성)
```

### 병렬 실행 가능 그룹

```
[T1.1, T1.2, T1.3, T1.4, T1.5] — CardFeed 독립 영역
[T2.2, T2.3, T2.4, T2.5, T2.7] — T2.1 완료 후
[T3.1, T3.2] — 독립
[T4.2, T4.3] — T4.1 완료 후
[T5.1, T5.3, T5.4] — 독립
```

---

## 7. 완료 기준 (Definition of Done)

### 기능 DoD

- [ ] `localhost:3000` 첫 방문 시 히어로 섹션 표시 (T4.5)
- [ ] 히어로 섹션 재방문 시 미표시 (localStorage 플래그)
- [ ] 첫 카드 조작 가이드 오버레이 표시 후 완료 시 미표시
- [ ] CategoryBar 활성 pill 자동 center-scroll (T3.2)
- [ ] 대시보드 탭 전환 AnimatePresence fade (T5.1)
- [ ] 스텝 0에서 좌측 탭 시 shake 피드백 (T2.8)
- [ ] OutroStep share 실패 시 toast 에러 메시지

### 기술 DoD

- [ ] `npm run build` 에러 없음
- [ ] `getAllCards()` 중복 호출 제거 확인 (React.cache 적용)
- [ ] `parseInlineAccent` 중복 3개소 → 단일 함수 통합
- [ ] `<img>` → `<Image>` 교체 완료 (RevealTitleStep, DialogueStep)
- [ ] localStorage 키 네임스페이스 통일 (`snapwise-*`)
- [ ] `@splinetool/react-spline` 사용 시 `{ ssr: false }` + Suspense 적용

### 성능/접근성 DoD

- [ ] Lighthouse 모바일 성능 95+ (회귀 없음)
- [ ] OS 모션 감소 설정 활성화 시 애니메이션 중단/감소
- [ ] Spline 3D: deviceMemory 2GB 이하 기기에서 CSS fallback 표시
- [ ] `npm run build` 빌드 시간 60초 이내

---

## 8. 비고

### 이번 개편 범위 밖 (Phase 2)

- 실제 좋아요/인기도 서버 연동 (현재 mock 해시 유지)
- 검색 기능 (`/search` 라우트)
- PWA/오프라인 지원
- `MangaSceneStep.tsx` 1324줄 전면 분리 리팩토링
- v2 레거시 `story/` 컴포넌트 완전 제거 (MDX 전수 마이그레이션 필요)
- 시리즈(챕터) 네비게이션 (CardMeta 필드는 존재함)
- localStorage → Zustand persist 완전 통합

### 알려진 SSOT 불일치

1. `CategoryKey` 타입: `koreanhistory`, `tmi` 추가됨 → `CLAUDE.md` 카테고리 표 업데이트 필요
2. `OutroStep.tsx:115` — `koreanhistory` 하드코딩 예외 처리 → 범용 로직으로 교체
