# SnapWise × Claude Design Redesign

**작업일:** 2026-05-11  
**컨셉:** Warm Intelligence — Anthropic Claude 신규 브랜드 디자인 언어 이식  
**빌드 결과:** ✅ 405페이지 SSG, TypeScript 에러 0

---

## 변경 요약

### T1 — 디자인 토큰 전면 교체 ✅
**파일:** `src/app/globals.css`

| 토큰 | 변경 전 | 변경 후 |
|------|---------|---------|
| `--color-bg` (light) | `#FAFAF8` | `#FAF9F7` |
| `--color-surface` | `#F4F4F1` | `#F2EFE8` |
| `--color-surface-2` | `#EEEEE9` | `#EAE5DC` |
| `--color-accent` | `#1A1A16` (잉크블랙) | `#D97706` (앰버 오렌지) |
| `--color-bg` (dark) | `#0D0D0B` | `#1A1816` |
| `--color-surface` (dark) | `#161614` | `#211E1A` |
| `--color-text-sub` | `#4A4A45` | `#6B625A` |

**신규 토큰:**
```css
--color-claude-orange: #D97706
--color-claude-amber:  #F59E0B
--color-claude-cream:  #FAF9F7
--font-serif:          'Lora', Georgia, serif
--grain-opacity:       0.025
```

**lang 유틸 클래스 추가:**
```css
.text-ko   { word-break: keep-all; overflow-wrap: break-word; line-break: strict; }
.text-en   { word-break: normal; overflow-wrap: break-word; hyphens: auto; }
.text-mixed { word-break: keep-all; overflow-wrap: break-word; }
```

---

### T2 — Lora Serif 타이포그래피 도입 ✅
**파일:** `src/app/layout.tsx`, `CinematicHook.tsx`, `RevealTitleStep.tsx`, `ImpactStep.tsx`

- `layout.tsx`: Google Fonts Lora (400, 600, italic) preconnect + link 추가
- `CinematicHook`: 타이틀에 `fontFamily: var(--font-serif)`, `fontStyle: italic` 적용 + 앰버 glow overlay
- `RevealTitleStep`: Lora Italic + 앰버 언더라인 scaleX 0→1 애니메이션 (600ms)
- `ImpactStep`: Lora Bold + 앰버 text-shadow (`rgba(245,158,11,0.4)`)

---

### T3 — 언어별 줄바꿈 최적화 ✅
**신규 파일:**
- `src/lib/lang.ts` — `detectLang(text): 'ko' | 'en' | 'mixed'` 유틸
- `src/components/ui/BreakText.tsx` — lang prop 기반 자동 className 컴포넌트

**수정 파일 (inline wordBreak → text-ko 클래스):**
- `NarrationStep.tsx` — 본문 `<p>`
- `DialogueStep.tsx` — 대화 텍스트
- `SceneStep.tsx` — caption + body
- `FactStep.tsx` — 헤드라인 + 부가설명
- `QuoteStep.tsx` — blockquote + attribution

---

### T4 — 핵심 스텝 컴포넌트 비주얼 업그레이드 ✅
**파일:** `OutroStep.tsx`, `VsStep.tsx`, `StatStep.tsx`

| 컴포넌트 | 변경 내용 |
|---------|---------|
| `OutroStep` | CTA 버튼 앰버(`#D97706`) + 9999px 라운드, 앰버 glow, 아이콘 `#F59E0B` 통일 |
| `VsStep` | 좌측=앰버(`#F59E0B`) / 우측=퍼플(`#7C6AF7`) 듀오톤, VS 배지 앰버 |
| `StatStep` | 수치 앰버 glow, 진행 바 `linear-gradient(#D97706, #F59E0B)` |

---

### T5 — 글로벌 UI 컴포넌트 업데이트 ✅
**파일:** `StepProgressBar.tsx`, `CategoryBar.tsx`, `OutroStep.tsx`

| 컴포넌트 | 변경 내용 |
|---------|---------|
| `StepProgressBar` | 진행 세그먼트 `#D97706` + glow, 미진행 `rgba(255,255,255,0.18)` |
| `CategoryBar` | 활성 pill `#D97706` + fontWeight 600 + shadow, hover `rgba(217,119,6,0.10)` |
| 좋아요/저장 버튼 | 활성 좋아요 `#F59E0B` / 활성 저장 `#7C6AF7`, glassmorphism 컨테이너 |

---

### T6 — Grain Texture + Spring 애니메이션 ✅
**파일:** `globals.css`, `StoryCard.tsx`

- **Grain Overlay:** `.grain-overlay::before` pseudo-element, SVG fractalNoise, opacity 0.025
- **Spring 전환:** zoom/default variant → `{ type: 'spring', stiffness: 380, damping: 38 }`
- opacity 전용(snap/dramatic) 및 `repeat: Infinity` 애니메이션은 tween 유지

---

### T7 — 빌드 검증 ✅

```
✓ TypeScript: 0 errors (npx tsc --noEmit)
✓ Build: Compiled successfully
✓ SSG: 405/405 pages generated
```

---

## 디자인 원칙 (Warm Intelligence)

| 항목 | 값 |
|------|---|
| 프라이머리 accent | `#D97706` (앰버 오렌지) |
| 다크모드 accent | `#F59E0B` (밝은 앰버) |
| 세컨더리 accent | `#7C6AF7` (소프트 퍼플) |
| 배경 (light) | `#FAF9F7` (따뜻한 크림) |
| 배경 (dark) | `#1A1816` (따뜻한 잉크블랙) |
| 헤드라인 폰트 | Lora Italic/Bold (Serif) |
| 본문 폰트 | Pretendard Variable (Sans) |
| 한국어 줄바꿈 | `word-break: keep-all; line-break: strict` |
| 영어 줄바꿈 | `word-break: normal; hyphens: auto` |
| 페이퍼 텍스처 | SVG fractalNoise grain, opacity 0.025 |
| 카드 전환 | Spring (stiffness 380, damping 38) |

---

## 버그 수정

### BUG-1: Outro 좋아요/저장 버튼 활성 시 아이콘 비가시 ✅
**파일:** `src/components/cinematic/OutroStep.tsx`

**증상:** 활성 시 버튼 배경(앰버 `#F59E0B` / 퍼플 `#7C6AF7`)과 아이콘 색(`fill`/`stroke`)이 동일해서 아이콘이 배경에 묻혀 보이지 않음.

**수정:**
- Heart fill/stroke: 활성 시 `#F59E0B` → `#FFFFFF`
- Bookmark fill/stroke: 활성 시 `#7C6AF7` → `#FFFFFF`
- 비활성 상태(`rgba(255,255,255,0.5)`)는 유지

---

## 추후 개선 후보

### 우선순위 P1 (시각 일관성)
- [ ] **CinematicHook 줄바꿈 통일** — `wordBreak: 'keep-all'` inline 스타일을 `text-ko` 클래스로 교체 (T3와 일관성)
- [ ] **앰버 하드코딩 변수화** — `ImpactStep`, `OutroStep` 등에 흩어진 `#F59E0B`/`#D97706` 하드코딩 → `var(--color-claude-amber)` / `var(--color-claude-orange)` CSS 변수로 통일
- [ ] **`BreakText` 컴포넌트 실제 활용** — 현재 `text-ko` 클래스만 직접 적용 중이며, 자동 언어 감지가 필요한 다국어 카드에 `BreakText` 컴포넌트 도입

### 우선순위 P2 (기능 보강)
- [ ] **VsStep 카테고리별 accent 옵션** — 현재 앰버/퍼플 고정. 카테고리에 따라 색 조합 변경 옵션 추가 검토
- [ ] **라이트모드 카드 배경 검증** — 시네마틱 카드는 다크 그라디언트가 기본이라 라이트모드 효과 미미. 라이트 전용 warm surface 카드 디자인 검토
- [ ] **Lora 폰트 가중치 추가** — 현재 400/600만 사용. 700(Bold)/800 추가로 ImpactStep 더 강한 임팩트 가능

### 우선순위 P3 (UX 디테일)
- [ ] **Grain z-index 검증** — `grain-overlay::before`의 `z-index: 1`이 카드 내부 인터랙티브 요소와 충돌 가능. 런타임 시각 검증 필요
- [ ] **앰버 글로우 다크모드 보정** — 다크모드에서 앰버 텍스트 가독성 추가 검증 (현재 `#F59E0B`로 라이트 보상)
- [ ] **CategoryBar 카테고리별 accent 복원** — 현재 활성 pill 모두 `#D97706` 고정. 카테고리별 색상 vs 통일 앰버 중 디자인 결정 필요
- [ ] **아이콘 색상 자동화** — 활성 버튼의 아이콘 색을 배경 대비로 자동 계산하는 유틸 (BUG-1 같은 충돌 사전 차단)

### 우선순위 P4 (확장)
- [ ] **PWA 매니페스트 themeColor 동기화** — `manifest.json` themeColor를 `#1A1816`/`#FAF9F7`로 업데이트
- [ ] **Lora 한국어 대응** — Lora는 라틴 문자 전용. 한국어 텍스트는 자동으로 Pretendard fallback되지만 폰트 일관성 검토 필요
- [ ] **다크모드 grain opacity 조정** — 현재 `0.025` 고정. 다크모드에서는 약간 더 강하게(`0.04`) 적용 검토
