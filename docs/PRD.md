# SnapWise - 숏폼 지식 블로그 PRD

## 1. 프로젝트 개요

**프로젝트명**: SnapWise
**컨셉**: TikTok/Reels 스타일 세로 스와이프 지식 카드 웹앱
**목표**: 짧고 유용한 지식을 풀스크린 카드로 소비하는 경험 제공
**경로**: `D:\park\YD_Claude_RND\shortform-blog`

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 동적 인터랙션 + SSG + Vercel 최적화 |
| 언어 | TypeScript | 타입 안정성 |
| 스타일 | Tailwind CSS v4 | 유틸리티 퍼스트, 빠른 개발 |
| 애니메이션 | Framer Motion (motion) | 카드 진입/전환 애니메이션 |
| 콘텐츠 | MDX + gray-matter | 파일 기반 콘텐츠 관리 |
| 폰트 | Pretendard | 한국어 최적 가독성 |
| 배포 | Vercel | GitHub push → 자동 빌드/배포 |

## 3. 핵심 기능

### 3.1 카드 스와이프 피드
- 세로 스와이프로 카드 넘기기 (CSS scroll-snap)
- 한 화면에 하나의 카드 (100dvh 풀스크린)
- 터치(모바일) + 마우스 휠(데스크톱) + 키보드 지원
- Framer Motion 콘텐츠 진입 애니메이션

### 3.2 카드 디자인
```
┌──────────────────────────────┐
│ [카테고리 배지]   [읽기시간]  │
│                              │
│          🧠                  │  ← 대형 이모지
│                              │
│  TypeScript의                │
│  유틸리티 타입 5선            │  ← 제목 (bold, 24-28px)
│  ─────────────               │
│                              │
│  1. Partial<T> - 모든 속성   │
│     선택적으로              │
│  2. Pick<T, K> - 특정 속성   │  ← 본문 (max 500자)
│     선택                     │
│  ...                         │
│                              │
│  #TypeScript #유틸리티타입    │  ← 태그
│  [공유] [북마크]   ▲ 스와이프 │  ← 액션 바
└──────────────────────────────┘
```

### 3.3 카테고리 시스템 (5개)

| 카테고리 | 이모지 | 색상 | 그라디언트 |
|---------|--------|------|-----------|
| IT/개발 | 💻 | #6366F1 (Indigo) | blue→indigo |
| 과학 | 🔬 | #10B981 (Emerald) | emerald→teal |
| 생활팁 | 💡 | #F59E0B (Amber) | amber→orange |
| 비즈니스 | 📊 | #8B5CF6 (Violet) | violet→purple |
| 교양/문화 | 🎨 | #F43F5E (Rose) | rose→pink |

### 3.4 네비게이션
- **모바일**: 상단 수평 스크롤 카테고리 바
- **데스크톱**: 좌측 사이드바 + 카테고리 카운트
- 다크모드 토글

### 3.5 SEO & 공유
- 개별 카드 URL (`/card/[slug]`)
- JSON-LD Article 스키마
- OG 메타태그
- Web Share API (모바일) / 클립보드 복사 (데스크톱)
- 북마크 (localStorage)

## 4. 프로젝트 구조

```
shortform-blog/
├── content/                     # MDX 카드 콘텐츠
│   ├── it/                      # IT/개발 카드
│   ├── science/                 # 과학 카드
│   ├── life/                    # 생활팁 카드
│   ├── business/                # 비즈니스 카드
│   └── culture/                 # 교양/문화 카드
├── public/
│   ├── favicon.svg
│   └── og-default.png
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 메인 피드
│   │   ├── globals.css          # Tailwind + CSS 변수
│   │   ├── card/[slug]/page.tsx # 개별 카드 (SEO)
│   │   ├── category/[category]/page.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── feed/
│   │   │   ├── CardFeed.tsx     # scroll-snap 컨테이너
│   │   │   ├── KnowledgeCard.tsx # 카드 UI
│   │   │   ├── CardContent.tsx
│   │   │   ├── SwipeIndicator.tsx
│   │   │   └── CardProgress.tsx
│   │   ├── navigation/
│   │   │   ├── CategoryBar.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── card-parts/
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── TagList.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   └── BookmarkButton.tsx
│   │   └── ui/
│   │       ├── ThemeToggle.tsx
│   │       └── Skeleton.tsx
│   ├── lib/
│   │   ├── content.ts           # MDX 파싱 유틸
│   │   ├── categories.ts        # 카테고리 정의
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useSwipe.ts
│   │   └── useBookmarks.ts
│   └── types/
│       └── content.ts
```

## 5. MDX Frontmatter 스키마

```yaml
---
title: "TypeScript 유틸리티 타입 5선"   # 최대 40자
emoji: "🧠"                             # 대표 이모지 1개
category: "it"                           # it|science|life|business|culture
tags: ["TypeScript", "유틸리티타입"]      # 최대 3개
difficulty: 2                            # 1=초급, 2=중급, 3=고급
style: "gradient"                        # gradient|solid|glass (선택, 기본=gradient)
pubDate: "2026-02-15"                    # 발행일
source: "https://..."                    # 출처 URL (선택)
draft: false                             # 초안 여부 (기본=false)
---
```

## 6. 콘텐츠 가이드라인

| 규칙 | 값 |
|------|-----|
| 제목 최대 길이 | 40자 (한국어) |
| 본문 최대 길이 | 500자 |
| 본문 최소 길이 | 150자 |
| 이모지 | frontmatter에 1개 필수 |
| 태그 | 최대 3개 |
| 문체 | 간결, 핵심 위주 |
| 숫자 리스트 | 적극 활용 (스캔 용이) |
| 코드 블록 | IT만, 최대 5줄 |
| 볼드 | 핵심 키워드만 강조 |
| 미래 날짜 | 금지 |

## 7. 스와이프 기술 상세

### CSS Scroll Snap (기본)
```css
.feed-container {
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100dvh;
}
.card {
  height: 100dvh;
  scroll-snap-align: start;
}
```

### Intersection Observer (카드 감지)
- threshold: 0.5 (50% 이상 보이면 현재 카드)
- 감지 시: currentIndex 업데이트 + URL shallow 업데이트

### 마우스 휠 (데스크톱)
- deltaY > 0: 다음 카드 scrollTo
- 200ms debounce로 연속 스크롤 방지

### 키보드
- ArrowDown / Space: 다음 카드
- ArrowUp: 이전 카드

## 8. 카테고리별 초기 콘텐츠 (50장)

### IT/개발 (10장)
1. Git rebase vs merge - 언제 뭘 써야 할까
2. TypeScript 유틸리티 타입 5선
3. REST vs GraphQL vs gRPC 한눈에 비교
4. Docker 핵심 명령어 10개
5. React useEffect 클린업 함수의 진짜 역할
6. CSS Container Query가 Media Query를 대체하는 이유
7. 웹 성능 지표 CLS, LCP, FID 한 줄 정리
8. Next.js App Router vs Pages Router 차이점
9. 정규표현식 자주 쓰는 패턴 7개
10. HTTP 상태 코드 완벽 가이드

### 과학 (10장)
1. 블랙홀 정보 역설 - 물리학 최대 미스터리
2. mRNA 백신이 작동하는 원리
3. 광합성 공식 하나로 지구가 살아있다
4. 양자 얽힘을 카페 비유로 이해하기
5. 인간 뇌의 뉴런 수 vs 은하의 별 수
6. CRISPR 유전자 가위 - 원리와 윤리
7. 화성 테라포밍이 불가능에 가까운 3가지 이유
8. 엔트로피를 냉장고로 이해하기
9. 플라시보 효과는 진짜로 몸을 치료하는가
10. 태양이 갑자기 사라지면 8분 뒤에 일어나는 일

### 생활팁 (10장)
1. 포모도로 테크닉 - 25분의 마법
2. 2분 법칙: 미루기 습관 끝내는 방법
3. 잠을 줄여도 피곤하지 않은 수면 사이클 비밀
4. 냉장고 정리법 - 음식물 쓰레기 50% 줄이기
5. 인지 편향 5가지 - 매일 당하는 생각의 함정
6. 아이젠하워 매트릭스로 우선순위 정하기
7. 디지털 디톡스 7일 실천법
8. 작은 방을 넓어 보이게 하는 5가지 인테리어 팁
9. 습관 형성에 걸리는 실제 기간 (21일은 신화)
10. 자외선 차단제 SPF 숫자의 진짜 의미

### 비즈니스 (10장)
1. OKR vs KPI - 뭐가 다른가
2. 린 스타트업 MVP 실전 3단계
3. 단위 경제학이 중요한 이유
4. 네트워크 효과의 4가지 유형
5. TAM/SAM/SOM - 시장 규모 추정법
6. 퍼널 분석 AARRR 프레임워크 한 장 정리
7. A/B 테스트에서 가장 흔한 실수 3가지
8. 구독 비즈니스 핵심 지표 MRR, Churn, LTV
9. 피터 드러커의 경영 명언 5선
10. Y Combinator가 강조하는 스타트업 원칙 3가지

### 교양/문화 (10장)
1. 바우하우스 디자인 원칙 - 100년이 지나도 유효한 이유
2. 르네상스가 시작된 진짜 이유 (흑사병)
3. 오컴의 면도날 - 가장 단순한 설명이 최선
4. 트롤리 딜레마로 보는 윤리학 기초
5. 플라톤의 동굴 비유 - 현대판 해석
6. 색채 심리학 - 빨간색이 식욕을 자극하는 이유
7. 일본 와비사비 철학과 미니멀리즘의 차이
8. 음악의 4분 33초 - 존 케이지가 말하려 한 것
9. 피보나치 수열이 자연에 숨어있는 곳
10. 인쇄술이 세상을 바꾼 3단계

## 9. 구현 단계

### Phase 1: MVP 스와이프 피드
- Next.js 프로젝트 셋업 (TS + Tailwind + App Router)
- 카테고리/타입 정의
- MDX 파싱 유틸
- IT 카테고리 카드 5장 작성
- KnowledgeCard + CardFeed 컴포넌트
- 메인 피드 페이지

### Phase 2: SEO + 카테고리 + 네비게이션
- 개별 카드 페이지 + generateStaticParams
- 카테고리 필터 피드
- CategoryBar 네비게이션
- JSON-LD, sitemap, robots
- ShareButton
- 나머지 카테고리 카드 25장 추가

### Phase 3: 애니메이션 + 폴리시
- Framer Motion 카드 애니메이션
- SwipeIndicator, CardProgress
- useSwipe 훅 완성
- BookmarkButton, ThemeToggle
- 카드 배경 스타일 3종

### Phase 4: 배포
- Vercel 배포
- Lighthouse 검증 (95+)
- 추가 카드 20장

## 10. 핵심 패키지

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "gray-matter": "^4.0.3",
    "motion": "^12.0.0",
    "remark": "^15.0.0",
    "remark-html": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0"
  }
}
```

## 11. URL 구조

| 경로 | 용도 |
|------|------|
| `/` | 전체 카테고리 셔플 피드 |
| `/category/it` | IT 카테고리 피드 |
| `/category/science` | 과학 카테고리 피드 |
| `/category/life` | 생활팁 카테고리 피드 |
| `/category/business` | 비즈니스 카테고리 피드 |
| `/category/culture` | 교양/문화 카테고리 피드 |
| `/card/[slug]` | 개별 카드 (공유/SEO용) |

## 12. 성과 지표

- Lighthouse 모바일 성능: 95+
- First Contentful Paint: < 1.5s
- Total Blocking Time: < 200ms
- 카드 스와이프 응답 시간: < 16ms (60fps)
