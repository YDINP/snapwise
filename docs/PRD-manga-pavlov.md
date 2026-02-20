# PRD v2: 망가 스타일 카드 — 파블로프의 개

## 1. 개요

### 1.1 목표
기존 시네마틱 카드 시스템에 **일본 망가 스타일** 변형을 도입하여,
"파블로프의 개" 주제를 드라마틱한 만화적 연출로 전달하는 프로토타입 카드 1장을 제작한다.

### 1.2 v1 → v2 변경 사항 (이슈 분석 반영)
| 항목 | v1 (원안) | v2 (개선안) | 이유 |
|------|----------|-----------|------|
| 레이아웃 | 5종 (2-h, 2-v, 3-L, 3-R, 4-grid) | **2종 (top-bottom, left-right)** | 모바일 360px에서 3칸+ 불가 |
| MDX 문법 | `{효과: 집중선}`, `{의성어: 텍스트}` | `<!-- effect:focus -->`, `**의성어**` | 중괄호 MDX/JSX 충돌 방지 |
| manga-spread | 신규 컴포넌트 | **기존 SplashStep 확장** | 90% 겹침, 말풍선만 추가 |
| 칸 분할 방식 | CSS Grid 복잡 레이아웃 | **상하 2칸 (flex-col) + 거터** | 모바일 가독성 확보 |

---

## 2. 파블로프의 개 — 스토리 각색

### 2.1 핵심 팩트
| 항목 | 내용 |
|------|------|
| 인물 | 이반 파블로프 (1849-1936), 러시아 생리학자 |
| 시기 | 1897-1902년, 상트페테르부르크 |
| 원래 연구 | 소화액 분비 연구 (심리학이 아님!) |
| 우연한 발견 | 사육사 발소리만 듣고 개가 침을 흘림 |
| 실험 도구 | 종이 아니라 **메트로놈, 전기 부저, 소리굽쇠** (종은 오역) |
| 노벨상 | 1904년 생리의학상 (소화 연구로, 조건반사가 아님) |
| 위액 판매 | 연간 3,000L 이상, 연구소 예산 70% 충당 |

### 2.2 망가 스토리 6막 구조
1. **HOOK**: "종소리만 들어도 침이 고인다" — 미스터리 제시
2. **ACT 1** (manga-scene): 소화 연구자 파블로프, 이상한 현상 목격
3. **ACT 2** (manga-scene): 메트로놈 실험 — 반복 훈련 과정
4. **CLIMAX** (splash): **"째깍... 침이 흐른다!"** — 조건반사 발견
5. **EVIDENCE**: stat(수치) → vs(비교) → impact(현대 적용)
6. **REVEAL + OUTRO**: 제목 공개 + 실천법

---

## 3. 시스템 설계

### 3.1 신규 Step Type: `manga-scene`

**목적**: 상하(또는 좌우) 2칸 분할 만화 패널로 스토리 전달

**레이아웃**:
- `top-bottom` (기본): 상하 2칸 (각 50%)
- `left-right`: 좌우 2칸 (각 50%, 태블릿+ 전용)
- 모바일에서 `left-right`는 자동으로 `top-bottom`으로 폴백

**렌더링 스펙**:
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │  Panel 1            │ │  ← 흰배경 + 스크린톤
│ │  나레이션 캡션       │ │  ← 좌상단 사각 박스
│ │  캐릭터 + 말풍선     │ │  ← 기존 PanelStep 방식
│ │  **의성어**          │ │  ← 기울어진 큰 텍스트
│ └─────────────────────┘ │
│  ■■■■ 6px 검은 거터 ■■■ │  ← 망가 칸 구분
│ ┌─────────────────────┐ │
│ │  Panel 2            │ │
│ │  효과선 (집중선)     │ │  ← SVG radial lines
│ │  대사 + 리액션       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**패널 내부 요소**:
| 요소 | 표현 방식 | MDX 문법 |
|------|----------|---------|
| 대사 | 말풍선 (기존 PanelStep 재사용) | `characterId: "대사"` |
| 나레이션 | 좌상단 사각 캡션 박스 (검은 배경+흰 텍스트) | `*(시간, 장소)*` |
| 의성어 | 기울어진 큰 텍스트 (accent 색상, 그림자) | `**째깍째깍**` (bold 파싱) |
| 효과선 | SVG 집중선 or CSS 속도선 | 패널에 `focus` 또는 `speed` 키워드 |
| 스크린톤 | CSS radial-gradient 도트 패턴 | 자동 (패널 배경) |

**MDX 문법 (단순화)**:
```mdx
<!-- step:manga-scene -->
[panel]
*(상트페테르부르크, 1901년)*
pavlov: "소화액 분비량을 측정하는 중이다."

[panel:focus]
*(개가 사육사 발소리에 반응한다)*
**뚝... 뚝...**
pavlov: "잠깐... 음식도 없는데 왜 침을?"
```

- `[panel]` — 패널 구분자 (순서대로 상/하)
- `[panel:focus]` — 집중선 효과 포함
- `[panel:speed]` — 속도선 효과 포함
- `[panel:impact]` — 충격 프레임 (불규칙 테두리)

### 3.2 기존 SplashStep 확장

manga-spread는 별도 컴포넌트 없이, 기존 `splash` step을 그대로 사용.
이미 24개 속도선 + 방사형 버스트 + 드라마틱 텍스트가 있으므로 충분.

### 3.3 망가 시각 요소

| 요소 | 구현 | 적용 위치 |
|------|------|----------|
| 패널 프레임 | 흰배경 + 2px 검은 border + border-radius: 4px | manga-scene 각 패널 |
| 거터 | 6px gap (검은 배경 노출) | 패널 사이 |
| 스크린톤 | `radial-gradient(circle, #000 0.8px, transparent 0.8px)` 16px 간격, opacity 0.06 | 패널 배경 |
| 집중선 | SVG 16~20개 `<line>` 방사형, opacity 0.12 | `[panel:focus]` |
| 속도선 | CSS `repeating-linear-gradient` 수평선, opacity 0.08 | `[panel:speed]` |
| 충격 프레임 | `clip-path: polygon(...)` 불규칙 다각형 | `[panel:impact]` |
| 말풍선 | 기존 PanelStep 스타일 재사용 | 대사 라인 |
| 나레이션 캡션 | 검은 배경 + 흰 텍스트, 좌상단 절대위치 | `*(텍스트)*` |
| 의성어 | `**텍스트**` → accent 색상, font-size: 1.5rem, rotate(-8deg), text-shadow | bold 파싱 시 |

---

## 4. MDX 카드 전체 스토리보드

### 11스텝 구성

```
#1  cinematic-hook    "종소리만 들어도 침이 고인다."
#2  manga-scene       ACT 1: 연구실 / 이상한 발견
#3  manga-scene       ACT 2: 실험 설계 / 메트로놈 훈련
#4  manga-scene       ACT 3: 반복... 반복... / 결정적 순간
#5  splash            CLIMAX: "째깍째깍... 침이 흐른다!"
#6  dialogue:pavlov   "이것은 학습된 반사다."
#7  stat              5년 연구, 700+ 실험견, 1904 노벨상
#8  vs                무조건반사 vs 조건반사
#9  impact            현대판: 알림음, 광고, SNS
#10 reveal-title      🐕 파블로프의 개
#11 outro             실천법 + 마무리
```

### 각 스텝 상세

**#1 cinematic-hook**
```
종소리만 들어도
침이 고인다.
**그 실험은 우연히 시작됐다.**
```

**#2 manga-scene (연구실 + 발견)**
```
[panel]
*(상트페테르부르크, 1901년)*
pavlov: "오늘도 소화액 분비량을 기록한다."

[panel:focus]
*(문이 열린다. 사육사의 발소리)*
**뚝... 뚝...**
pavlov: "음식도 없는데... 왜 침을 흘리는 거지?"
```

**#3 manga-scene (실험 설계)**
```
[panel]
*(실험실. 메트로놈이 놓여 있다)*
pavlov: "이 소리와 음식을 반복해서 연결시키겠다."

[panel:speed]
*(째깍째깍 — 음식 — 침 분비)*
*(째깍째깍 — 음식 — 침 분비)*
**반복... 반복... 반복...**
```

**#4 manga-scene (결정적 순간)**
```
[panel]
*(10번째 시도. 이번엔 음식 없이)*
pavlov: "메트로놈만 울려라."

[panel:impact]
**째깍째깍...**
*(음식은 없다. 하지만—)*
**침이 흐른다.**
```

**#5 splash (클라이맥스)**
```
🐕 학습되지 않은 반사가... 학습되었다!
─────
**조건반사의 탄생.**
1901년, 심리학의 역사가 바뀐 순간.
```

**#6~#11**: 기존 step type 그대로 활용

---

## 5. 멀티 에이전트 태스크 (v2)

### 5.1 에이전트 구성 (간소화)

```
┌──────────────────────────────────────┐
│          🎯 CONDUCTOR (메인)          │
│      전체 조율, 통합, 빌드/배포       │
└────────┬──────────┬─────────────────┘
         │          │
   ┌─────▼────┐ ┌──▼──────────┐
   │ Agent A  │ │  Agent B     │
   │ Architect│ │  Implementor │
   │ (Opus)   │ │  (Sonnet)    │
   │          │ │              │
   │ 설계+타입│ │ 컴포넌트+MDX │
   └──────────┘ └──────────────┘
```

### 5.2 태스크 목록

---

#### TASK 1: 타입 시스템 확장 (Agent A — Opus)
**의존성**: 없음
**예상 소요**: 5분

- [ ] 1.1 `V3StepType`에 `'manga-scene'` 추가
- [ ] 1.2 `VALID_V3_TYPES` 배열에 등록
- [ ] 1.3 `parseSteps()` — manga-scene 파라미터 파싱 (layout 등, 현재는 미사용)
- [ ] 1.4 `CinematicRenderer.tsx` — manga-scene case 추가

**변경 파일**: `src/types/content.ts`, `src/lib/content.ts`, `src/components/cinematic/CinematicRenderer.tsx`

---

#### TASK 2: MangaSceneStep 컴포넌트 (Agent B — Sonnet)
**의존성**: TASK 1 완료 후
**예상 소요**: 20분

- [ ] 2.1 패널 파서: `[panel]`, `[panel:focus]`, `[panel:speed]`, `[panel:impact]` 구분
- [ ] 2.2 패널 레이아웃: flex-col + 6px gap (검은 거터)
- [ ] 2.3 패널 프레임: 흰배경, 2px border, border-radius 4px
- [ ] 2.4 스크린톤 배경: radial-gradient 도트 패턴
- [ ] 2.5 대사 렌더링: 기존 PanelStep의 말풍선 로직 재사용
- [ ] 2.6 나레이션 캡션: `*(text)*` → 검은 배경 좌상단 박스
- [ ] 2.7 의성어: `**text**` → 큰 기울어진 텍스트, accent 색상
- [ ] 2.8 효과선:
  - `focus` → SVG 집중선 (16~20개 radial)
  - `speed` → CSS 수평 속도선
  - `impact` → 불규칙 패널 테두리
- [ ] 2.9 Framer Motion 애니메이션:
  - 패널 순차 등장 (상→하, delay 0.3s)
  - 말풍선 pop-in (spring)
  - 효과선 draw-in
  - 의성어 stamp-in (scale 1.3→1 + rotate)

**변경 파일**: `src/components/cinematic/MangaSceneStep.tsx` (신규)

---

#### TASK 3: MDX 카드 작성 (Agent B — Sonnet, TASK 2와 순차)
**의존성**: TASK 2 완료 후

- [ ] 3.1 frontmatter (title, emoji, category, characters, glossary)
- [ ] 3.2 cinematic-hook 작성
- [ ] 3.3 manga-scene ×3 작성 (스토리보드 기반)
- [ ] 3.4 splash 클라이맥스 작성
- [ ] 3.5 dialogue + stat + vs + impact 작성
- [ ] 3.6 reveal-title + outro 작성

**변경 파일**: `content/psychology/pavlov-dog.mdx` (신규)

---

#### TASK 4: 통합 테스트 + 빌드 + 배포 (Conductor)
**의존성**: TASK 1~3 모두 완료

- [ ] 4.1 dev 서버에서 카드 렌더링 확인
- [ ] 4.2 패널 분할 + 말풍선 + 효과선 확인
- [ ] 4.3 빌드 성공 확인 (318 페이지)
- [ ] 4.4 커밋 + 배포

---

### 5.3 실행 순서

```
TASK 1 (타입, 5분)
  └──→ TASK 2 (컴포넌트, 20분) ──→ TASK 3 (MDX, 10분) ──→ TASK 4 (빌드/배포)
```

**총 예상**: TASK 1~3 순차 실행 → TASK 4 통합

---

## 6. 리스크 & 대응 (v2)

| 리스크 | 확률 | 대응 |
|--------|------|------|
| 패널 내 텍스트 오버플로 | 중 | 텍스트 줄 수 제한 (패널당 3줄), overflow-hidden |
| 효과선이 텍스트 가려짐 | 중 | 효과선 z-index 낮게, opacity 0.08~0.12 |
| 모바일에서 패널 높이 부족 | 낮 | min-height: 40%, 내용 적응형 |
| `[panel]` 파싱 에러 | 낮 | 폴백: 파싱 실패 시 기존 PanelStep으로 렌더 |
| 스크린톤 성능 | 낮 | CSS만 사용, SVG 최소화 |

## 7. 성공 기준

- [ ] manga-scene 상하 2칸 패널이 정상 렌더링
- [ ] 말풍선, 나레이션 캡션, 의성어가 각각 표시
- [ ] 효과선(집중선/속도선/충격)이 패널 내 동작
- [ ] 기존 step type과 혼용 동작 (splash, dialogue, stat, vs, impact 등)
- [ ] 11스텝 카드 전체 플로우 정상
- [ ] 모바일(360px)에서 가독성 확보
- [ ] 빌드 성공 + Vercel 배포
