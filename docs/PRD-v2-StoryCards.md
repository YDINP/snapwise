# SnapWise v2.0 PRD — Story Cards UX 고도화

> **Version**: 2.1
> **Date**: 2026-02-16
> **Status**: Draft (Revised)
> **Author**: YD + Claude

---

## 1. 배경 & 문제 정의

### 현재 상태 (v1.0)
- 한 화면(100dvh)에 카드 전체 내용이 **한 번에** 표시됨
- 세로 스와이프로 다음 카드로 이동
- 콘텐츠: 백과사전식 나열 (팩트 → 설명 → 팁)
- 비주얼: 그라디언트 배경 + 이모지만 있고 **이미지 없음**
- 셔플: `날짜 기반 시드` → **새로고침해도 동일 순서** 반복

### 문제점 3가지 (사용자 피드백 반영)

| # | 문제 | 현재 | 원인 |
|---|------|------|------|
| **1** | 새로고침 시 같은 순서 반복 | `shuffleCards(seed=날짜)` | SSG 빌드 시점에 순서 고정, 클라이언트에서 재셔플 없음 |
| **2** | 콘텐츠가 딱딱하고 궁금증 없음 | "매몰 비용이란 ~입니다" 설명체 | 팩트 나열식 → 스토리/서사 없음. 읽고 바로 이탈 |
| **3** | 시각적 단조로움 | 그라디언트+이모지만 | 실제 이미지 없음. 텍스트 피로도 높음 |

### 벤치마크
| 서비스 | 핵심 패턴 | 배울 점 |
|--------|----------|---------|
| **Instagram Stories** | 탭→다음, 진행 바 | 탭 진행 + 진행률 시각화 |
| **TikTok** | 세로 풀스크린, 알고리즘 | **매번 다른 순서** + 몰입감 |
| **뉴닉/어피티** | 뉴스+스토리텔링 | **딱딱한 정보를 친구처럼** 전달 |
| **숏폼 드라마 (Reelshort)** | 2분 클리프행어 | **서사 기반 중독성**. 다음 회가 궁금 |
| **Carousel Posts (인스타)** | 좌우 10장 | 정보 분할 + **히어로 이미지** 필수 |

---

## 2. 핵심 설계 변경 3가지

### 변경 1: 매번 다른 순서 (Random Feed)

**문제**: `shuffleCards(seed = 오늘 날짜)` → 같은 날 같은 순서
**해결**: 서버(SSG)에서 전체 카드 목록만 전달, **클라이언트에서 `Math.random()` 기반 셔플**

```
[v1] 서버 SSG → 날짜 시드 셔플 → 고정 순서 HTML
[v2] 서버 SSG → 전체 카드 배열 → 클라이언트 hydration 시 랜덤 셔플
```

**구현 방식**:
```typescript
// page.tsx (서버)
const allCards = getAllCards(); // 정렬만, 셔플 안 함
return <CardFeed cards={allCards} />;

// CardFeed.tsx (클라이언트)
const [shuffled, setShuffled] = useState<CardMeta[]>([]);
useEffect(() => {
  setShuffled(fisherYatesShuffle([...cards])); // Math.random 기반
}, []); // mount 시 1회, 새로고침마다 새 순서
```

**추가 장치 — "이미 본 카드 후순위"**:
- `localStorage`에 최근 본 카드 slug 저장 (최대 50개)
- 셔플 후 이미 본 카드는 배열 뒤쪽으로 밀기
- 결과: 새로고침할 때마다 **안 본 카드가 먼저** 등장

| 전 | 후 |
|----|----|
| 매번 A→B→C→D | 새로고침마다 D→B→A→C, C→A→D→B ... |
| 이미 본 카드도 동일 위치 | 안 본 카드 우선, 본 카드는 뒤로 |

---

### 변경 2: 스토리텔링 콘텐츠 ("숏폼 드라마")

**문제**: "매몰 비용이란 이미 지출한 비용 때문에~" 같은 **교과서 설명체**
**해결**: 각 지식을 **드라마/동화/실화 기반 스토리**로 풀어내기

#### Before (v1) vs After (v2) — "매몰 비용" 예시

**v1 (현재 — 백과사전식)**:
```
🧠 매몰 비용의 오류

매몰 비용의 오류(Sunk Cost Fallacy): 이미 지출한 비용 때문에
잘못된 결정을 계속하는 심리적 함정입니다.

일상 속 사례:
- 재미없는 영화: "티켓값 냈으니 끝까지~"
- 안 맞는 직업: "5년 투자했는데~"
...
```

**v2 (스토리 카드)**:
```
<!-- step:hook -->
이미지: 공항 활주로에서 콩코드 비행기

"10조 원을 쏟아부은 뒤에야, 그들은 깨달았다.
처음부터 틀렸다는 걸."

<!-- step:story -->
이미지: 1960년대 영국-프랑스 회담 장면

1962년, 영국과 프랑스는 꿈의 초음속 여객기를 만들기로 했다.
이름은 **콩코드**.

하지만 개발 3년 만에 적자가 확실해졌다.
비용은 눈덩이처럼 불어났고,
수요 예측은 처참했다.

**"지금 멈추면 지금까지 쓴 돈이 아깝잖아."**

이 한마디가 30년을 지배했다.

<!-- step:reveal -->
이미지: 부서진 저금통 클로즈업

이것이 바로 **매몰 비용의 오류 (Sunk Cost Fallacy)**.

> 이미 지출한 비용에 끌려 잘못된 결정을 계속하는 심리적 함정.

당신의 일상에도 숨어 있다:
- 🎬 재미없는 영화 — "티켓값 냈으니 끝까지"
- 💼 안 맞는 직업 — "5년 투자했는데 아까워"
- 📱 안 쓰는 구독 — "이번 달은 이미 결제했으니"

<!-- step:action -->
이미지: 밝은 길 위에 서 있는 사람 실루엣

💡 콩코드는 결국 2003년 퇴역했다.
30년간 쓴 돈: **약 10조 원**.

**올바른 판단법:**
이미 쓴 비용은 잊어라.
**"지금부터 얻을 가치"**만으로 결정하라.

과거는 되돌릴 수 없다. 미래만 바꿀 수 있다.
```

#### 스토리텔링 공식: "HBRA" 프레임워크

| 스텝 | 역할 | 서사 장치 | 감정선 |
|------|------|----------|--------|
| **H**ook | 낚시 | 충격적 팩트 / 미스터리 질문 / 드라마틱 장면 | 😮 "뭐야?!" |
| **B**ackstory | 이야기 전개 | 실화/일화/비유/시나리오 | 🤔 "그래서?" |
| **R**eveal | 핵심 공개 | 지식 포인트 + 일상 연결 | 💡 "아하!" |
| **A**ction | 마무리 | 한 줄 교훈 + 실천법 | ✊ "나도 해볼래" |

**기존 `hook/insight/detail/action` → `hook/story/reveal/action` 으로 명칭 변경**

#### 스토리 패턴 5가지

| 패턴 | 설명 | 적합 카테고리 | 예시 |
|------|------|-------------|------|
| **실화 기반** | 유명한 역사적 사건/인물 | 비즈니스, 문화 | 콩코드 → 매몰비용, 스티브잡스 → 디자인씽킹 |
| **What-if 시나리오** | "만약 ~했다면?" 가상 상황 | 과학, IT | "만약 빛보다 빠른 문자를 보낸다면?" → 양자얽힘 |
| **미니 동화** | 의인화/비유 스토리 | 라이프, 문화 | "작은 도마뱀이 꼬리를 자르고~" → 손절의 지혜 |
| **1인칭 체험** | "나는 ~했다" 체험담 | IT, 라이프 | "새벽 3시, 서버가 죽었다" → Docker 필수 명령어 |
| **반전 오프닝** | 통념을 뒤집는 시작 | 전체 | "멀티태스킹이 능력이라고? 틀렸다." → 포모도로 |

#### MDX v2 Frontmatter 확장

```yaml
---
title: "매몰 비용의 오류"
emoji: "💸"
category: "culture"
tags: ["경제학", "의사결정"]
difficulty: 1
pubDate: "2026-02-16"
# ★ v2 신규 필드
storyType: "realStory"              # realStory | whatIf | fable | firstPerson | twist
images:                              # 스텝별 히어로 이미지
  hook: "concorde-runway.jpg"
  story: "british-french-meeting.jpg"
  reveal: "broken-piggybank.jpg"
  action: "person-bright-road.jpg"
---
```

---

### 변경 3: 이미지 기반 카드 비주얼

**문제**: 그라디언트+이모지만 → 시각적 단조로움
**해결**: 각 스텝마다 **분위기에 맞는 상업용 무료 이미지** 사용

#### 이미지 소스

| 소스 | 라이선스 | 용도 | API |
|------|---------|------|-----|
| **Pexels** | 무료 상업 사용 (CC0 유사) | 메인 이미지 소스 | Pexels API (키 보유) |
| **Unsplash** | 무료 상업 사용 | 보조 소스 | Unsplash API |
| **Pixabay** | 무료 상업 사용 | 백업 소스 | Pixabay API |

**기존 Pexels API 키**: `auC4jZ0hXy8yWDBX2UakTc0ywXJ4BIS99taY8HJRZx2Y9K5w6K3iDmmv`

#### 이미지 크롤링 전략

빌드 타임에 이미지를 미리 다운로드하여 `/public/images/cards/` 에 저장:

```
scripts/fetch-images.ts
├─ MDX frontmatter에서 images 필드 읽기
├─ 각 스텝의 키워드로 Pexels API 검색
├─ 1200x800 해상도 다운로드
├─ public/images/cards/{slug}/{step}.jpg 저장
└─ 빌드 시 next/image로 최적화
```

**이미지가 없는 카드**: 기존 그라디언트 배경 유지 (하위 호환)

#### 이미지 표시 방식 — 풀스크린 배경

```
┌──────────────────────────────────────┐
│  ■■■□  ← 진행 바                     │
│                                      │
│                                      │
│  ╔══════════════════════════════╗    │
│  ║                              ║    │  ← 풀스크린 이미지 (object-cover)
│  ║    (히어로 이미지)            ║    │
│  ║                              ║    │
│  ║                              ║    │
│  ╚══════════════════════════════╝    │
│                                      │
│  ┌─ 반투명 오버레이 ──────────────┐  │
│  │  텍스트 콘텐츠 영역            │  │  ← 하단 40~60%, 그라디언트 오버레이
│  │  (글래스모피즘 or 그라디언트)   │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

**스텝별 이미지 전략**:

| 스텝 | 이미지 비중 | 텍스트 비중 | 레이아웃 |
|------|-----------|-----------|---------|
| **Hook** | 70% (풀스크린 배경) | 30% (하단 오버레이) | 이미지 위에 큰 텍스트 |
| **Story** | 50% (상단 절반) | 50% (하단 글래스) | 이미지+스토리 분할 |
| **Reveal** | 30% (배경 블러) | 70% (중앙 글래스 카드) | 핵심 내용에 포커스 |
| **Action** | 40% (배경 은은히) | 60% (요약 카드) | CTA 강조 |

#### 이미지 최적화 (성능)

| 기법 | 구현 |
|------|------|
| **next/image** | 자동 WebP/AVIF 변환, 리사이징 |
| **blur placeholder** | 빌드 시 10px 블러 해시 생성 |
| **Lazy Loading** | 현재 카드 ± 1장만 이미지 로드 |
| **CDN 캐싱** | Vercel Edge Cache (자동) |

---

## 3. Story Card 스텝 구조

### 3.1 스텝 타입 (HBRA 프레임워크)

| 스텝 타입 | 역할 | 시각적 특징 |
|-----------|------|-------------|
| `hook` | 낚시 — 충격/호기심 (첫 스텝 고정) | **풀스크린 이미지** + 대형 텍스트 오버레이 |
| `story` | 서사 전개 — 드라마/일화/비유 | 이미지 상반 + **스토리 글래스 카드** 하반 |
| `reveal` | 핵심 공개 — 지식 포인트 | 배경 블러 + **핵심 글래스 카드** 중앙 |
| `action` | 마무리 — 교훈/실천 (마지막 스텝 고정) | 은은한 배경 + **요약 + CTA 버튼** |
| `quiz` | (선택) 퀴즈 | 선택지 버튼 → 정답 공개 |

### 3.2 스텝 흐름

**3-Step (빠른 지식)**:
```
[hook] → [reveal] → [action]
```

**4-Step (표준 스토리, 권장)**:
```
[hook] → [story] → [reveal] → [action]
```

**5-Step (심화/퀴즈)**:
```
[hook] → [story] → [reveal] → [quiz] → [action]
```

### 3.3 MDX 콘텐츠 포맷 (v2 전체 예시)

```yaml
---
title: "페르미 역설: 외계인은 어디에?"
emoji: "👽"
category: "science"
tags: ["우주", "철학"]
difficulty: 2
pubDate: "2026-02-16"
storyType: "whatIf"
images:
  hook: "night-sky-stars.jpg"
  story: "enrico-fermi-portrait.jpg"
  reveal: "galaxy-spiral.jpg"
  action: "telescope-sunset.jpg"
---

<!-- step:hook -->
우주에는 별이 **2,000억 × 2,000억** 개 있다.

그런데 왜, 단 한 번도
외계 문명의 신호를 받지 못했을까?

<!-- step:story -->
1950년 여름, 로스앨러모스 연구소 식당.

핵물리학의 거장 **엔리코 페르미**가
동료들과 점심을 먹고 있었다.

UFO 만화를 보며 웃다가, 갑자기 진지해진 그가 물었다.

**"그래서 다들 어디 있는 거지?"**

그 한마디가 70년간 과학계를 뒤흔들었다.

<!-- step:reveal -->
이것이 **페르미 역설** — 우주의 가장 불편한 질문이다.

4가지 유력 가설:

🔴 **대필터 가설** — 모든 문명 앞에 넘을 수 없는 벽이 있다.
핵전쟁? AI 반란? 우리도 아직 못 넘었을 수 있다.

🟢 **동물원 가설** — 외계인이 우리를 관찰만 하고 있다.
우리가 개미집을 구경하듯.

🔵 **암흑숲 가설** — 모든 문명이 숨어 있다.
발각되면 즉시 제거당하니까.

⚪ **희소 지구 가설** — 우리가 우주에서 거의 유일하다.

<!-- step:action -->
70년이 지난 지금도 답은 없다.

하지만 한 가지는 확실하다:

> **"우리가 첫 번째이거나, 마지막 생존자이거나."**

밤하늘을 올려다볼 때, 그 침묵의 무게를 느껴보라.
당신이 올려다보는 그 별빛은, 이미 수백만 년 전의 것이다.
```

---

## 4. UI/UX 상세 설계

### 4.1 전체 인터랙션 모델

| 축 | 동작 | 용도 |
|----|------|------|
| **가로 (→)** | 탭(오른쪽 70%) / 클릭 / `→` / `Space` / `Enter` | 같은 카드 내 **다음 스텝** |
| **가로 (←)** | 탭(왼쪽 30%) / `←` | 같은 카드 내 **이전 스텝** |
| **세로 (↓)** | 스와이프 다운 / `↓` / 휠 다운 | **다음 카드**로 이동 |
| **세로 (↑)** | 스와이프 업 / `↑` / 휠 업 | **이전 카드**로 이동 |

**마지막 스텝에서 →**: 0.3초 후 다음 카드 Hook으로 자동 이동
**첫 스텝에서 ←**: 이전 카드 마지막 스텝으로 이동

### 4.2 스텝별 카드 레이아웃

#### Hook 스텝 (풀스크린 이미지 + 텍스트 오버레이)

```
┌──────────────────────────────────────┐
│  ■□□□  ← 진행 바                     │
│                                      │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃                                ┃   │
│  ┃      (풀스크린 히어로 이미지)    ┃   │
│  ┃       night-sky-stars.jpg      ┃   │
│  ┃                                ┃   │
│  ┃                                ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  ▓▓▓▓▓▓▓▓▓▓▓ (그라디언트 오버레이)   │
│                                      │
│     👽                               │
│                                      │
│     "우주에는 별이                     │
│      2,000억 × 2,000억개 있다.       │
│                                      │
│      그런데 왜, 단 한 번도            │
│      외계 문명의 신호를               │
│      받지 못했을까?"                  │
│                                      │
│   [🔬 과학]            탭하여 시작 →  │
└──────────────────────────────────────┘
```

- **이미지**: `object-cover`, 100dvh, 약간 어둡게 (brightness 0.6)
- **하단 그라디언트**: `linear-gradient(transparent 30%, black/80 100%)`
- **텍스트**: 하단 40%, 큰 사이즈, 볼드, 그림자
- **CTA**: 펄스 애니메이션 "탭하여 시작 →"

#### Story 스텝 (이미지 + 서사)

```
┌──────────────────────────────────────┐
│  ■■□□  ← 진행 바                     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │    (이미지: 상단 40%)           │  │
│  │    enrico-fermi-portrait.jpg   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌─ 글래스 카드 ─────────────────┐   │
│  │                               │   │
│  │  1950년 여름,                  │   │
│  │  로스앨러모스 연구소 식당.      │   │
│  │                               │   │
│  │  핵물리학의 거장               │   │
│  │  엔리코 페르미가               │   │
│  │  동료들과 점심을 먹고 있었다.   │   │
│  │                               │   │
│  │  **"그래서 다들 어디 있는 거지?"**│  │
│  │                               │   │
│  │  그 한마디가 70년간             │   │
│  │  과학계를 뒤흔들었다.           │   │
│  │                               │   │
│  └───────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

- **이미지**: 상단 35~45%, `object-cover`, rounded-b
- **글래스 카드**: `bg-black/40 backdrop-blur-xl`, 하단 55~65%
- **텍스트**: 소설체, 짧은 줄 바꿈, **핵심 대사 볼드**

#### Reveal 스텝 (배경 블러 + 핵심 카드)

```
┌──────────────────────────────────────┐
│  ■■■□  ← 진행 바                     │
│                                      │
│  ┏━━━━━━ (배경: 이미지 블러 처리) ━━┓│
│  ┃                                  ┃│
│  ┃   이것이 **페르미 역설**          ┃│
│  ┃   우주의 가장 불편한 질문이다.    ┃│
│  ┃                                  ┃│
│  ┃  ┌──────────────────────────┐   ┃│
│  ┃  │ 🔴 대필터 가설            │   ┃│
│  ┃  │    넘을 수 없는 벽이 있다 │   ┃│
│  ┃  ├──────────────────────────┤   ┃│
│  ┃  │ 🟢 동물원 가설            │   ┃│
│  ┃  │    외계인이 관찰만 중      │   ┃│
│  ┃  ├──────────────────────────┤   ┃│
│  ┃  │ 🔵 암흑숲 가설            │   ┃│
│  ┃  │    모든 문명이 숨어 있다   │   ┃│
│  ┃  ├──────────────────────────┤   ┃│
│  ┃  │ ⚪ 희소 지구 가설          │   ┃│
│  ┃  │    우리가 거의 유일하다    │   ┃│
│  ┃  └──────────────────────────┘   ┃│
│  ┃                                  ┃│
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛│
└──────────────────────────────────────┘
```

- **배경**: 이전 스텝 이미지를 `blur(20px) + brightness(0.3)` 처리
- **콘텐츠**: 중앙 정렬, 글래스 리스트 카드
- **리스트**: 컬러 불릿 + 간결한 설명
- **stagger 애니메이션**: 리스트 항목 순차 등장 (80ms 딜레이)

#### Action 스텝 (요약 + CTA)

```
┌──────────────────────────────────────┐
│  ■■■■  ← 진행 바 (완료!)             │
│                                      │
│  ┏━━━━ (배경: 은은한 이미지) ━━━━━━┓ │
│  ┃                                  ┃ │
│  ┃   💡                             ┃ │
│  ┃                                  ┃ │
│  ┃   70년이 지난 지금도              ┃ │
│  ┃   답은 없다.                     ┃ │
│  ┃                                  ┃ │
│  ┃  ┌────────────────────────┐     ┃ │
│  ┃  │                        │     ┃ │
│  ┃  │  "우리가 첫 번째이거나, │     ┃ │
│  ┃  │   마지막 생존자이거나." │     ┃ │
│  ┃  │                        │     ┃ │
│  ┃  └────────────────────────┘     ┃ │
│  ┃                                  ┃ │
│  ┃  [📤 공유하기]    [🔖 저장하기]  ┃ │
│  ┃                                  ┃ │
│  ┃  ─── 다음 이야기 ───            ┃ │
│  ┃  💸 "10조 원을 쏟아부은 뒤에야~" ┃ │  ← 다음 카드 프리뷰
│  ┃                                  ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└──────────────────────────────────────┘
```

- **배경**: 이미지 `brightness(0.4)` + 약간의 블러
- **인용 카드**: 테두리 + `glow` 효과
- **CTA 버튼**: 크고 눈에 띄게 (공유 + 북마크)
- **다음 카드 프리뷰**: 이모지 + Hook 첫 줄 미리보기 → 다음 카드 궁금증

### 4.3 스텝 진행 바

Instagram Stories 스타일:

```
[■■■■■][■■■■■][■■▓░░][░░░░░]    (3/4 진행 중)

■ = 완료 세그먼트 (흰색 100%)
▓ = 현재 진행 중 (애니메이션으로 채워지는 중)
░ = 아직 안 본 세그먼트 (흰색 30%)
```

- 높이: 3px, 세그먼트 간 간격 3px
- 상단 고정, `z-50`
- 현재 세그먼트: 좌→우 fill 애니메이션 (3초, 자동 넘김 없이 시각적 효과만)

### 4.4 터치 영역

```
┌──────────────────────────────────────┐
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │  ◀ PREV  │  │    ▶ NEXT       │  │
│  │  (30%)   │  │    (70%)        │  │
│  │          │  │                  │  │
│  └──────────┘  └──────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

- 오른쪽 70% 탭: 다음 스텝
- 왼쪽 30% 탭: 이전 스텝
- 탭 리플 없음 (깔끔)
- 길게 누르기: 정보 패널 (출처, 난이도, 태그)

---

## 5. 시각 디자인

### 5.1 이미지 + 그라디언트 레이어링

```
Layer 4 (최상단): 텍스트 콘텐츠
Layer 3: 글래스 패널 (bg-black/40 backdrop-blur-xl)
Layer 2: 그라디언트 오버레이 (하단→상단 페이드)
Layer 1: 히어로 이미지 (object-cover, 100dvh)
Layer 0: 폴백 카테고리 그라디언트 (이미지 없을 때)
```

### 5.2 스텝 전환 애니메이션

| 전환 | 효과 | 시간 |
|------|------|------|
| **→ 다음 스텝** | 이미지 crossfade + 텍스트 오른쪽에서 slide-in | 400ms |
| **← 이전 스텝** | 반대 방향 | 400ms |
| **Hook 진입** | 이미지 zoom(1.1→1.0) + 텍스트 fade-up | 600ms |
| **Story 진입** | 이미지 slide-down + 글래스카드 slide-up | 500ms |
| **Reveal 리스트** | stagger(각 100ms) + scale(0.9→1) | 500ms |
| **Action 인용카드** | scale(0.95→1) + glow pulse | 400ms |

### 5.3 카테고리별 이미지 검색 키워드

Pexels API 검색 시 카테고리에 맞는 검색어 조합:

| 카테고리 | 기본 키워드 | 분위기 |
|---------|-----------|--------|
| IT·테크 | technology, code, digital, circuit | 미래적, 블루톤 |
| 과학 | science, space, laboratory, nature | 신비, 장엄 |
| 라이프 | lifestyle, morning, minimalist, nature | 따뜻, 밝음 |
| 비즈니스 | business, strategy, meeting, chart | 세련, 프로 |
| 문화 | art, philosophy, books, architecture | 감성, 깊이 |

### 5.4 타이포그래피 계층

| 요소 | 모바일 | 데스크톱 | Weight | 비고 |
|------|--------|---------|--------|------|
| Hook 텍스트 | text-2xl (24px) | text-4xl (36px) | 700 | 그림자 필수 |
| Hook CTA | text-sm (14px) | text-base (16px) | 500 | 펄스 애니메이션 |
| Story 본문 | text-base (16px) | text-lg (18px) | 400 | **대사는 bold** |
| Reveal 제목 | text-xl (20px) | text-2xl (24px) | 700 | |
| Reveal 리스트 | text-sm (14px) | text-base (16px) | 400 | |
| Action 인용 | text-lg (18px) | text-xl (20px) | 600 | 이탤릭 |
| Action 교훈 | text-base (16px) | text-lg (18px) | 500 | |

---

## 6. 인게이지먼트 전략

### 6.1 이탈 방지 퍼널

```
유저 진입 (새로고침 → 새 순서)
  │
  ├→ Hook: 풀스크린 이미지 + 충격 문구
  │    → 감정: 😮 "뭐야?!" (호기심)
  │    → 탭하여 시작
  │
  ├→ Story: 드라마/일화 전개
  │    → 감정: 🤔 "그래서 어떻게 됐어?" (몰입)
  │    → 읽으며 다음 탭
  │
  ├→ Reveal: 핵심 지식 공개
  │    → 감정: 💡 "아 이거였구나!" (깨달음)
  │    → 리스트 순차 등장
  │
  ├→ Action: 교훈 + CTA + 다음 카드 프리뷰
  │    → 감정: ✊ "공유해야겠다" / "다음 것도 궁금한데?"
  │    → 공유/저장/다음 카드
  │
  └→ 다음 카드 Hook → 루프 반복
```

### 6.2 이미 본 카드 관리 (Seen Queue)

```typescript
// hooks/useSeenCards.ts
const SEEN_KEY = 'snapwise_seen';
const MAX_SEEN = 50;

// 카드 본 기록 저장
function markSeen(slug: string): void {
  const seen = getSeen();
  seen.unshift(slug);
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(0, MAX_SEEN)));
}

// 셔플 시 안 본 카드 우선 배치
function prioritizeUnseen(cards: CardMeta[]): CardMeta[] {
  const seen = new Set(getSeen());
  const unseen = cards.filter(c => !seen.has(c.slug));
  const seenCards = cards.filter(c => seen.has(c.slug));
  return [...fisherYatesShuffle(unseen), ...fisherYatesShuffle(seenCards)];
}
```

### 6.3 세션 깊이 극대화

| 전략 | 구현 |
|------|------|
| **다음 카드 프리뷰** | Action 스텝 하단에 다음 카드 이모지 + Hook 첫 줄 |
| **"한 장 더?" 넛지** | 3장 읽으면 "벌써 3장! 한 장 더?" 마이크로 토스트 |
| **카드 완료 카운터** | 하단에 "오늘 N장 완료" (localStorage) |
| **마지막 스텝 자동 전환** | 마지막 스텝 → 탭 시 다음 카드 Hook으로 자연스럽게 |

### 6.4 진행률 & 보상 심리

- **스텝 진행 바**: 채워지는 시각적 만족감
- **카드 완료 시**: 미니 체크 애니메이션 (✓ 200ms)
- **공유 CTA**: "이 이야기를 친구에게도 들려주세요"
- **북마크**: "나중에 다시 읽기" (localStorage)

---

## 7. 컴포넌트 아키텍처

### 7.1 컴포넌트 트리

```
src/
├── app/
│   ├── page.tsx                     # [수정] 셔플 제거, raw 배열 전달
│   ├── card/[slug]/page.tsx         # [수정] 스토리 카드 레이아웃
│   └── category/[category]/page.tsx # [수정] 동일
│
├── components/
│   ├── feed/
│   │   ├── CardFeed.tsx             # [수정] 클라이언트 셔플 + seen 우선
│   │   └── StoryCard.tsx            # [신규] ★ 핵심: 스텝 기반 카드
│   ├── story/
│   │   ├── StepProgressBar.tsx      # [신규] 상단 세그먼트 바
│   │   ├── StepRenderer.tsx         # [신규] 스텝 타입별 분기
│   │   ├── HookStep.tsx             # [신규] 풀스크린 이미지 + 오버레이 텍스트
│   │   ├── StoryStep.tsx            # [신규] 이미지 + 서사 글래스 카드
│   │   ├── RevealStep.tsx           # [신규] 블러 배경 + 핵심 리스트
│   │   ├── ActionStep.tsx           # [신규] 요약 + CTA + 다음 프리뷰
│   │   ├── QuizStep.tsx             # [신규] 선택지 퀴즈 (Phase 후순위)
│   │   └── StepTransition.tsx       # [신규] Framer Motion 전환
│   ├── navigation/
│   │   └── CategoryBar.tsx          # [유지]
│   ├── card-parts/
│   │   ├── CategoryBadge.tsx        # [유지]
│   │   ├── TagList.tsx              # [유지]
│   │   ├── ShareButton.tsx          # [수정] 더 크게
│   │   ├── BookmarkButton.tsx       # [신규]
│   │   └── NextCardPreview.tsx      # [신규] 다음 카드 미리보기
│   └── ui/
│       └── GlassCard.tsx            # [신규] 재사용 글래스 컴포넌트
│
├── hooks/
│   ├── useSeenCards.ts              # [신규] 이미 본 카드 관리
│   ├── useBookmarks.ts             # [신규] 북마크
│   └── useStepNavigation.ts        # [신규] 스텝 좌우 네비게이션
│
├── lib/
│   ├── content.ts                   # [수정] parseSteps() 추가, 셔플 수정
│   ├── categories.ts               # [유지]
│   ├── constants.ts                 # [유지]
│   └── images.ts                    # [신규] 이미지 경로 헬퍼
│
├── types/
│   └── content.ts                   # [수정] StepType, CardStep 추가
│
└── scripts/
    └── fetch-images.ts              # [신규] Pexels API 이미지 다운로더
```

### 7.2 타입 정의

```typescript
// types/content.ts

export type StepType = 'hook' | 'story' | 'reveal' | 'action' | 'quiz';

export type StoryType = 'realStory' | 'whatIf' | 'fable' | 'firstPerson' | 'twist';

export interface CardStep {
  type: StepType;
  content: string;       // 마크다운 본문
  image?: string;        // 이미지 파일명 (public/images/cards/{slug}/{image})
}

export interface CardMeta {
  title: string;
  slug: string;
  emoji: string;
  category: CategoryKey;
  tags: string[];
  difficulty: Difficulty;
  style: CardStyle;
  pubDate: string;
  source?: string;
  draft?: boolean;
  readingTime: number;
  content: string;        // raw 전체 본문 (하위 호환)
  // ★ v2 신규
  steps: CardStep[];      // 파싱된 스텝 배열
  storyType?: StoryType;  // 스토리 패턴
  images?: Record<string, string>;  // frontmatter images 맵
}
```

### 7.3 콘텐츠 파서

```typescript
// lib/content.ts — parseSteps()

function parseSteps(rawContent: string, images?: Record<string, string>): CardStep[] {
  const stepRegex = /<!--\s*step:(\w+)\s*-->/g;
  const parts = rawContent.split(stepRegex).filter(Boolean);

  // v2 포맷 (step 주석 있음)
  if (parts.length > 1) {
    const steps: CardStep[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const type = parts[i] as StepType;
      const content = parts[i + 1]?.trim() || '';
      steps.push({ type, content, image: images?.[type] });
    }
    return steps;
  }

  // v1 하위 호환 (자동 3스텝 분할)
  const paragraphs = rawContent.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length <= 2) {
    return [
      { type: 'hook', content: paragraphs[0] || '' },
      { type: 'action', content: paragraphs[1] || paragraphs[0] || '' },
    ];
  }
  return [
    { type: 'hook', content: paragraphs[0] },
    { type: 'story', content: paragraphs.slice(1, -1).join('\n\n') },
    { type: 'action', content: paragraphs[paragraphs.length - 1] },
  ];
}
```

---

## 8. 이미지 시스템

### 8.1 이미지 수급 파이프라인

```
1. MDX frontmatter에 images 필드 작성 (검색 키워드 또는 파일명)
2. scripts/fetch-images.ts 실행
   ├─ Pexels API로 검색 (landscape, 1280x720)
   ├─ 결과 없으면 Unsplash API 폴백
   ├─ public/images/cards/{slug}/{step}.jpg 저장
   └─ 메타데이터 JSON 생성
3. next build → next/image 자동 최적화
4. Vercel 배포 → Edge CDN 캐싱
```

### 8.2 이미지 검색 전략

MDX의 `images` 필드에 두 가지 형태 지원:

```yaml
# 방법 1: 직접 검색어 지정
images:
  hook: "search:night sky milky way"
  story: "search:scientist laboratory 1950s"
  reveal: "search:galaxy spiral nebula"
  action: "search:telescope sunset silhouette"

# 방법 2: 이미 다운로드된 파일명
images:
  hook: "night-sky-stars.jpg"
  story: "fermi-portrait.jpg"
```

### 8.3 이미지 폴백 체계

```
1순위: public/images/cards/{slug}/{step}.jpg (커스텀 이미지)
2순위: public/images/cards/{slug}/default.jpg (카드 대표 이미지 재사용)
3순위: 카테고리 기본 그라디언트 (이미지 없는 v1 카드)
```

### 8.4 성능 최적화

| 기법 | 구현 |
|------|------|
| `next/image` | WebP/AVIF 자동 변환, srcset 자동 생성 |
| `priority` | 첫 카드 Hook 이미지만 `priority={true}` |
| `placeholder="blur"` | 빌드 시 blurDataURL 생성 |
| **Lazy**: 현재 카드 ±1만 로드 | Intersection Observer 기반 |
| **사이즈**: max 1280px width | Pexels `?w=1280` 파라미터 |

---

## 9. 콘텐츠 마이그레이션

### 9.1 하위 호환

| 유형 | 처리 |
|------|------|
| v1 MDX (step 주석 없음) | 자동 3스텝 분할 (hook → story → action) |
| v1 MDX + 이미지 없음 | 카테고리 그라디언트 배경 유지 |
| v2 MDX (step 주석 있음) | 정확한 스텝 분할 |
| v2 MDX + images 필드 | 스텝별 이미지 적용 |

### 9.2 마이그레이션 순서

| 단계 | 작업 | 카드 수 |
|------|------|--------|
| **즉시** | 자동 분할로 전체 30개 카드 지원 (이미지 없이 그라디언트) | 30개 |
| **Phase A** | 인기 카드 10개 스토리 리라이트 + Pexels 이미지 | 10개 |
| **Phase B** | 나머지 20개 스토리 리라이트 + 이미지 | 20개 |
| **Phase C** | 신규 카드 20개 (v2 포맷 네이티브) | +20개 |

### 9.3 스토리 리라이트 우선순위

| 순위 | 카드 | 스토리 패턴 | 이유 |
|------|------|-----------|------|
| 1 | 매몰 비용의 오류 | 실화 (콩코드) | 드라마틱 실화 있음 |
| 2 | 페르미 역설 | What-if | 궁극의 미스터리 |
| 3 | 블루오션 전략 | 실화 (시르크 뒤 솔레이유) | 성공 스토리 |
| 4 | 디자인 씽킹 | 실화 (IDEO/Apple) | 실화+사례 풍부 |
| 5 | 도파민 메커니즘 | 1인칭 체험 | 일상 공감대 |
| 6 | 포모도로 테크닉 | 반전 오프닝 | "멀티태스킹은 거짓말" |
| 7 | 더닝-크루거 효과 | 미니 동화 | 비유 스토리 적합 |
| 8 | 깨진 유리창 이론 | 실화 (NYC 지하철) | 도시 전설 느낌 |
| 9 | Big O 표기법 | 1인칭 체험 | "서버가 터졌다" |
| 10 | Docker 명령어 | 1인칭 체험 | "새벽 3시 장애" |

---

## 10. 구현 Phase 계획

| Phase | 범위 | 주요 작업 | 우선도 |
|-------|------|----------|--------|
| **P1** | 스텝 엔진 + 랜덤 피드 | 파서, StoryCard, 클라이언트 셔플, seen 큐 | 🔴 필수 |
| **P2** | 스텝 UI (HBRA) | HookStep~ActionStep 4종 레이아웃 + 애니메이션 | 🔴 필수 |
| **P3** | 이미지 시스템 | Pexels 크롤러, next/image 통합, 폴백 체계 | 🔴 필수 |
| **P4** | 콘텐츠 리라이트 10개 | 인기 10개 카드 스토리 재작성 + 이미지 | 🟡 권장 |
| **P5** | 인게이지먼트 | NextCardPreview, BookmarkButton, SessionCounter | 🟡 권장 |
| **P6** | 나머지 리라이트 + 신규 | 20개 리라이트 + 20개 신규 (총 70개) | 🟢 점진 |
| **P7** | Quiz 스텝 | QuizStep 컴포넌트 + 10개 퀴즈 카드 | 🟢 선택 |

### P1 상세 — 스텝 엔진 + 랜덤 피드

**수정**:
- `types/content.ts` → StepType, CardStep, storyType 추가
- `lib/content.ts` → `parseSteps()`, `shuffleCards()` 수정 (클라이언트용 export)
- `app/page.tsx` → 셔플 제거, raw 배열 전달
- `components/feed/CardFeed.tsx` → 클라이언트 셔플 + seen 우선순위

**신규**:
- `components/feed/StoryCard.tsx` → 스텝 관리 + 터치/키보드
- `components/story/StepProgressBar.tsx`
- `components/story/StepRenderer.tsx`
- `hooks/useSeenCards.ts`
- `hooks/useStepNavigation.ts`

### P2 상세 — 스텝 UI

**신규**:
- `components/story/HookStep.tsx` — 풀스크린 이미지 + 오버레이
- `components/story/StoryStep.tsx` — 이미지+글래스카드 분할
- `components/story/RevealStep.tsx` — 블러 배경 + 리스트
- `components/story/ActionStep.tsx` — 요약 + CTA + 프리뷰
- `components/story/StepTransition.tsx` — Framer Motion
- `components/ui/GlassCard.tsx`

### P3 상세 — 이미지 시스템

**신규**:
- `scripts/fetch-images.ts` — Pexels API 크롤러
- `lib/images.ts` — 이미지 경로 유틸
- 이미지 폴백 체계 (커스텀 → 카드 기본 → 그라디언트)
- `next.config.mjs` → images.remotePatterns 설정 (필요 시)

---

## 11. 성공 지표

| 지표 | 현재 (추정) | 목표 | 측정 |
|------|------------|------|------|
| **평균 세션** | ~2분 | **5분+** | GA4 |
| **카드당 체류** | ~20초 | **45초+** | 스텝 이벤트 |
| **세션당 카드** | ~5장 | **12장+** | 카드 뷰 이벤트 |
| **스텝 완주율** | N/A | **75%+** | action 스텝 도달 |
| **공유율** | ~1% | **5%+** | 공유 버튼 이벤트 |
| **재방문율** | 미측정 | **35%+** | GA4 |
| **바운스율** | ~60% | **30% 이하** | GA4 |
| **새 카드 발견** | 0 (같은 순서) | **매 방문 3장+ 새 카드** | seen 큐 분석 |

---

## 12. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 클라이언트 셔플 → SSG hydration mismatch | 깜빡임 | `useState([])` → `useEffect` 셔플로 mount 후 렌더 |
| 스토리 리라이트 품질 편차 | 일부 카드 어색 | HBRA 템플릿 엄수 + 리뷰 |
| Pexels API 한도 (200 req/hour) | 이미지 못 가져옴 | 빌드 타임 1회만 실행 + 로컬 캐시 |
| 이미지 용량 증가 | 로딩 느려짐 | next/image + blur placeholder + lazy |
| 이미지 없는 v1 카드와 v2 카드 이질감 | UX 불일치 | 그라디언트 폴백을 v2 느낌으로 보강 |
| 스텝 탭 조작 vs 세로 스와이프 충돌 | 의도와 다른 동작 | 터치 방향 감지: 수직 이동 > 수평 → 스와이프 우선 |

---

## 부록 A: 스토리텔링 패턴 가이드

### 패턴 1: 실화 기반 (realStory)

```
Hook: "1962년, 한 남자의 꿈이 두 나라를 삼켰다."
Story: 실제 일어난 사건을 시간순으로 서술
Reveal: 그 사건에서 추출한 지식/법칙
Action: 내 삶에 적용하는 법
```
**적합**: 비즈니스, 문화, 과학사

### 패턴 2: What-if 시나리오 (whatIf)

```
Hook: "만약 내일 지구에 외계인이 연락해 온다면?"
Story: 가상 시나리오를 생생하게 전개
Reveal: 시나리오 속에 숨은 과학/이론
Action: 현실에서의 시사점
```
**적합**: 과학, IT

### 패턴 3: 미니 동화 (fable)

```
Hook: "옛날 옛적, 가장 똑똑한 개구리가 살았다."
Story: 의인화/비유 스토리 전개
Reveal: 동화 속 교훈 = 실제 이론
Action: 실생활 적용
```
**적합**: 문화, 라이프, 심리학

### 패턴 4: 1인칭 체험 (firstPerson)

```
Hook: "새벽 3시, 알람이 울렸다. 서버가 죽었다."
Story: 체험담을 생생하게 서술
Reveal: 이 사건에서 배운 기술/지식
Action: 똑같은 상황에서의 대처법
```
**적합**: IT, 라이프

### 패턴 5: 반전 오프닝 (twist)

```
Hook: "멀티태스킹 잘하시죠? 그거 거짓말입니다."
Story: 통념이 왜 틀린지 근거 제시
Reveal: 진짜 올바른 지식
Action: 실천법
```
**적합**: 전체 카테고리

---

## 부록 B: 콘텐츠 작성 규칙

### 스텝별 글자 수

| 스텝 | 최소 | 권장 | 최대 |
|------|------|------|------|
| Hook | 20자 | 40~80자 | 100자 |
| Story | 80자 | 120~250자 | 300자 |
| Reveal | 60자 | 100~200자 | 250자 |
| Action | 30자 | 50~120자 | 150자 |
| Quiz | 30자 | 50~100자 | 150자 |

### 문체 규칙

- **Hook**: 문장 짧게. 줄바꿈 자주. 질문 or 충격. **"~했다."** 과거형 허용.
- **Story**: 소설 문체. 짧은 문장 연속. **대사는 굵게**. 감정 유도.
- **Reveal**: 교과서→대화체 전환. "이것이 바로 **X**다." 패턴.
- **Action**: 명령형. "~하라." "~해보라." 강한 어투. 인용문 활용.

### 이미지 선택 가이드

- **Hook**: 감정을 자극하는 **풍경/상황** (우주, 폐허, 군중, 자연)
- **Story**: 이야기 속 **인물/장소** 연상 이미지
- **Reveal**: **추상적/상징적** 이미지 (블러 OK)
- **Action**: **밝고 희망적** 이미지 (빛, 길, 새벽)
