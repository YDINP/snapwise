# SnapWise v3.0 PRD — Cinematic Knowledge Cards

## Vision
**"영상을 보듯, 만화를 읽듯"** — 지식을 시네마틱 스토리로 전달하는 풀스크린 카드 앱

## Problem Statement (v2.2 피드백)
1. **텍스트 과다**: 한 페이지에 글이 너무 많아 읽기 힘듦
2. **시각적 단조로움**: 그라디언트 배경만으로는 몰입감 부족
3. **정적 구성**: 영상/만화처럼 흘러가는 느낌 부족
4. **제목 노출 타이밍**: 첫 화면에서 주제를 알려주면 서스펜스 부족

## Core Design Principles

### 1. 초단문 (Ultra-Short Text)
- 페이지당 **2-3줄**, 최대 **80자** (한글 기준)
- 한 페이지 = 한 가지 아이디어만
- 대사/내레이션 형식으로 자연스러운 읽기

### 2. 시네마틱 플로우 (Cinematic Flow)
- 카드당 **8-15스텝** (기존 3-6 → 대폭 확대)
- 각 스텝이 "영상의 한 컷" 느낌
- 순차적 fade-in이 아니라, 스텝 전환 자체가 콘텐츠 진행
- 배경색/분위기가 스텝마다 변화

### 3. 캐릭터 기반 스토리텔링 (Character-Driven)
- 실제 역사 인물/가상 캐릭터가 대사를 통해 설명
- 대화 버블 UI (만화/웹툰 스타일)
- 인물 이미지: Pexels 시나리오 사진 + 이모지/아이콘 캐릭터

### 4. 타이틀 라스트 (Title-Last Reveal)
- Hook에서 주제명을 숨김 → 미스터리/호기심 유발
- 마지막 스텝에서 "이것이 바로 OOO입니다" 타이틀 공개
- 공개 순간 임팩트 애니메이션

## Architecture Changes

### New Step Types

| Type | 용도 | 비주얼 | 텍스트량 |
|------|------|--------|---------|
| `cinematic-hook` | 미스터리 오프닝 | 풀스크린 이미지 + 짧은 내레이션 | 1-2줄 |
| `scene` | 시대/장소 설정 | 배경 이미지 + 자막 스타일 텍스트 | 1-2줄 |
| `dialogue` | 캐릭터 대사 | 캐릭터 이미지 + 말풍선 | 1-3줄 |
| `narration` | 내레이터 설명 | 이미지 위 텍스트 오버레이 | 2-3줄 |
| `impact` | 핵심 한 줄 | 큰 텍스트 중앙 배치 | 1줄 |
| `reveal-title` | 타이틀 공개 | 임팩트 애니메이션 + 제목 | 제목 + 1줄 |
| `outro` | 마무리/CTA | 요약 + 공유 + 다음 카드 | 2-3줄 |

### Removed/Deprecated
- `hook` → `cinematic-hook` (미스터리 중심으로)
- `story`/`detail`/`example` → `scene`/`dialogue`/`narration` (시네마틱)
- `reveal`/`tip`/`compare` → `impact`/`reveal-title` (임팩트 중심)
- `action` → `outro` (마무리)

### Card Structure Template

```
[cinematic-hook]  ← 미스터리 질문/상황 (이미지 풀스크린)
[scene]           ← "1905년, 스위스 베른의 특허청..."
[dialogue]        ← 아인슈타인: "빛의 속도는 누구에게나 같을까?"
[narration]       ← 이 질문이 세상을 바꿀 줄은 아무도 몰랐다.
[dialogue]        ← 막스 플랑크: "자네 논문을 봤네. 놀랍군."
[scene]           ← 논문 발표 후, 학계는 충격에 빠졌다.
[dialogue]        ← 아인슈타인: "E=mc²... 에너지와 질량은 같은 것이야."
[impact]          ← 우주의 법칙이 바뀐 순간.
[reveal-title]    ← 🎯 특수 상대성 이론
[outro]           ← 요약 + 공유 + 다음 카드
```

## Component Architecture

### New Components (Phase 1)

```
src/components/
├── cinematic/
│   ├── CinematicHook.tsx      # 미스터리 오프닝 (풀스크린 이미지)
│   ├── SceneStep.tsx          # 장면 설정 (배경+자막)
│   ├── DialogueStep.tsx       # 캐릭터 대사 (말풍선)
│   ├── NarrationStep.tsx      # 내레이션 (이미지 위 텍스트)
│   ├── ImpactStep.tsx         # 핵심 한 줄 (큰 텍스트)
│   ├── RevealTitleStep.tsx    # 타이틀 공개 (임팩트 애니)
│   ├── OutroStep.tsx          # 마무리/CTA
│   └── CinematicRenderer.tsx  # 타입별 분기 렌더러
├── ui/
│   ├── GlassCard.tsx          # (기존 유지)
│   ├── DialogueBubble.tsx     # 말풍선 컴포넌트
│   ├── CharacterAvatar.tsx    # 캐릭터 이모지/이미지
│   └── StepImage.tsx          # 스텝별 배경 이미지
```

### Image System

```
content/
├── it/
│   ├── typescript-utility-types.mdx
│   │   images:
│   │     hook: "programming code abstract"
│   │     scene: "office workspace"
│   │     character: "👨‍💻"
```

**이미지 소스 우선순위:**
1. Pexels API (빌드 타임 fetch → `public/images/cards/`)
2. 카테고리 기본 그라디언트 (폴백)

**Pexels 키**: `auC4jZ0hXy8yWDBX2UakTc0ywXJ4BIS99taY8HJRZx2Y9K5w6K3iDmmv`

### MDX v3 Format

```mdx
---
title: "특수 상대성 이론"
emoji: "⚡"
category: "science"
tags: ["물리학", "아인슈타인"]
difficulty: 2
storyType: "realStory"
characters:
  - id: einstein
    name: "아인슈타인"
    emoji: "👨‍🔬"
  - id: planck
    name: "막스 플랑크"
    emoji: "🧓"
images:
  hook: "mysterious light beams space"
  scene-1: "old european city 1900s"
  scene-2: "scientific conference hall"
pubDate: "2026-02-15"
---

<!-- step:cinematic-hook -->
어느 무명 공무원이 점심시간에 끄적인 수식이
**우주의 법칙을 바꿔버렸다.**

<!-- step:scene -->
1905년, 스위스 베른.
26살의 특허청 직원.

<!-- step:dialogue:einstein -->
"빛을 타고 달리면...
빛은 멈춰 보일까?"

<!-- step:narration -->
이 황당한 상상이
물리학의 역사를 뒤흔들 줄은
아무도 몰랐다.

<!-- step:dialogue:planck -->
"자네 논문을 읽었네.
세상이 바뀔 걸세."

<!-- step:impact -->
**E = mc²**

<!-- step:narration -->
에너지와 질량은
같은 것의 다른 얼굴이었다.

<!-- step:scene -->
100년이 지난 지금,
GPS부터 핵에너지까지.
그의 수식 없이는 작동하지 않는다.

<!-- step:reveal-title -->
⚡ 특수 상대성 이론
무명 공무원의 점심시간 상상이
우주의 비밀을 풀었다.

<!-- step:outro -->
**26살 특허청 직원 아인슈타인.**
점심시간의 상상이 우주를 바꿨습니다.
```

## Implementation Plan

### TASK-1: Core Type System + Parser (종속성: 없음)
**Branch**: `feat/v3-types-parser`
- `types/content.ts` — 새 StepType 7종 추가
- `lib/content.ts` — parseSteps v3 (dialogue:characterId 파싱)
- `types/content.ts` — Character 타입, ImageConfig 타입 추가
- 기존 v2 스텝 하위 호환 유지

### TASK-2: Cinematic Step Components (종속성: TASK-1)
**Branch**: `feat/v3-cinematic-components`
- `CinematicHook.tsx` — 풀스크린 배경 + 짧은 내레이션
- `SceneStep.tsx` — 배경 이미지 + 자막 스타일 텍스트 (하단)
- `DialogueStep.tsx` — 캐릭터 아바타 + 말풍선 + 대사
- `NarrationStep.tsx` — 이미지 오버레이 + 내레이션 텍스트
- `ImpactStep.tsx` — 중앙 대형 텍스트 + 임팩트 애니메이션
- `RevealTitleStep.tsx` — 타이틀 공개 (scale-up + glow)
- `OutroStep.tsx` — 요약 + 공유/북마크 + 다음 카드
- `CinematicRenderer.tsx` — v3 타입 분기 렌더러

### TASK-3: UI Components (종속성: 없음)
**Branch**: `feat/v3-ui-components`
- `DialogueBubble.tsx` — 말풍선 (좌/우 방향, 꼬리)
- `CharacterAvatar.tsx` — 이모지 기반 캐릭터 (원형, 이름)
- `StepImage.tsx` — Pexels 이미지 로더 + 폴백 그라디언트
- `globals.css` — 새 CSS 변수/유틸리티

### TASK-4: Image Pipeline (종속성: 없음)
**Branch**: `feat/v3-image-pipeline`
- `scripts/fetch-images.ts` — Pexels API 빌드 타임 이미지 다운로드
- `lib/images.ts` — 이미지 경로 해석기
- `public/images/cards/` — 다운로드된 이미지 저장
- Pexels 어트리뷰션 컴포넌트

### TASK-5: Cinematic MDX Content — Science (종속성: TASK-1)
**Branch**: `feat/v3-content-science`
- 과학 5개 카드 시네마틱 리라이트
- 8-15스텝, 대사/내레이션 형식, 80자 이내
- characters frontmatter, images frontmatter

### TASK-6: Cinematic MDX Content — IT (종속성: TASK-1)
**Branch**: `feat/v3-content-it`
- IT 10개 카드 시네마틱 리라이트

### TASK-7: Cinematic MDX Content — Life/Business/Culture (종속성: TASK-1)
**Branch**: `feat/v3-content-mixed`
- 생활 5개 + 비즈니스 5개 + 문화 5개 = 15개 리라이트

### TASK-8: Integration + StoryCard Update (종속성: TASK-1,2,3)
**Branch**: `feat/v3-integration`
- `StoryCard.tsx` — CinematicRenderer 연결
- `StepProgressBar.tsx` — 8-15스텝 대응 (얇은 바)
- v2 → v3 마이그레이션 (기존 카드 폴백)
- 빌드 검증 + 시각 테스트

### TASK-9: Deploy + QA (종속성: 모든 TASK)
**Branch**: `main`
- 전체 머지 → main
- Vercel 배포
- Playwright 시각 검증
- 모바일 실기기 테스트

## Task Dependency Graph

```
TASK-1 (Types+Parser) ─────────┬──→ TASK-5 (Science MDX)
                                ├──→ TASK-6 (IT MDX)
                                ├──→ TASK-7 (Mixed MDX)
                                └──→ TASK-8 (Integration) ──→ TASK-9 (Deploy)
                                      ↑
TASK-2 (Cinematic Components) ────────┘
TASK-3 (UI Components) ──────────────┘
TASK-4 (Image Pipeline) ─────────────┘
```

**병렬 가능 그룹:**
- Group A (독립): TASK-1, TASK-3, TASK-4
- Group B (TASK-1 완료 후): TASK-2, TASK-5, TASK-6, TASK-7
- Group C (전부 완료 후): TASK-8, TASK-9

## Visual Specifications

### DialogueStep Layout
```
┌──────────────────────────────┐
│                              │
│     [배경 이미지/그라디언트]     │
│                              │
│   ┌──────┐                   │
│   │ 👨‍🔬  │  ╭─────────────╮ │
│   │아인슈│  │ "빛을 타고   │ │
│   │타인  │  │  달리면..."  │ │
│   └──────┘  ╰─────────────╯ │
│                              │
│                              │
│         탭하여 계속 →         │
└──────────────────────────────┘
```

### ImpactStep Layout
```
┌──────────────────────────────┐
│                              │
│                              │
│                              │
│         E = mc²              │  ← 대형 텍스트, 글로우 효과
│                              │
│                              │
│                              │
└──────────────────────────────┘
```

### RevealTitleStep Layout
```
┌──────────────────────────────┐
│                              │
│           ⚡                 │  ← 이모지 scale-up
│                              │
│    특수 상대성 이론            │  ← 타이틀 fade-in
│                              │
│  무명 공무원의 점심시간        │
│  상상이 우주의 비밀을 풀었다.   │  ← 서브타이틀
│                              │
│                              │
└──────────────────────────────┘
```

## Success Metrics
- 페이지당 텍스트: 80자 이내
- 카드당 스텝 수: 8-15개
- 빌드 에러: 0
- Lighthouse 모바일: 90+
- 전체 30개 카드 시네마틱 리라이트 완료

## Tech Stack (unchanged)
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (`motion/react`)
- gray-matter (MDX 파싱)
- Pexels API (이미지)
- Vercel (배포)
