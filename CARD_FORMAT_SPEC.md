# SnapWise 카드 포맷 규격서

## 공통 Frontmatter

```yaml
---
title: "카드 제목"
emoji: "🔬"
category: "science"  # science|psychology|people|history|life|business|culture|origins|etc
tags: ["태그1", "태그2", "태그3"]
difficulty: 2  # 1(쉬움) | 2(보통) | 3(어려움)
storyType: "realStory"  # realStory | concept | myth
characters:  # 선택. 대화 스텝에 사용
  - id: character_id
    name: "캐릭터 이름"
    emoji: "🧑‍🔬"
glossary:  # 선택. 용어 설명 팝업
  - term: "용어"
    meaning: "설명"
coverImage: "https://..."  # 선택. reveal-title에서 표시
pubDate: "2026-02-15"
---
```

## 카테고리 (9개)

| key | label | 주제 범위 |
|-----|-------|----------|
| science | 과학 | 물리, 화학, 생물, 우주, 기술 |
| psychology | 심리 | 심리학 실험, 인지편향, 행동과학 |
| people | 인물 | 역사적 인물, 위인, 발명가 |
| history | 역사 | 역사적 사건, 전쟁, 혁명 |
| life | 라이프 | 생활 지식, 건강, 습관, 자기계발 |
| business | 비즈니스 | 기업, 경영, 경제, 스타트업 |
| culture | 문화 | 예술, 음악, 영화, 문학 |
| origins | 어원 | 단어 유래, 표현의 기원 |
| etc | 상식 | 기타 흥미로운 상식 |

---

## 방식 A: 시네마틱 스타일 (기본)

서사 중심. 장면 전환과 내레이션으로 스토리를 전달.

### 사용 스텝 타입

| 스텝 | 문법 | 용도 |
|------|------|------|
| cinematic-hook | `<!-- step:cinematic-hook -->` | 오프닝. 강렬한 첫 문장 |
| scene | `<!-- step:scene -->` | 🎬 장면 묘사. 시각적 배경 설정 |
| dialogue | `<!-- step:dialogue:캐릭터id -->` | 1인 대사. 이모지 아바타 + 말풍선 |
| narration | `<!-- step:narration -->` | 📖 서술. 팩트/설명 전달 |
| impact | `<!-- step:impact -->` | ⚡ 강조. 핵심 포인트 임팩트 |
| showcase | `<!-- step:showcase -->` | 목록/데이터 나열 |
| vs | `<!-- step:vs -->` | 비교 대결 레이아웃 |
| stat | `<!-- step:stat -->` | 통계/수치 강조 |
| quote | `<!-- step:quote -->` | 명언 인용 |
| reveal-title | `<!-- step:reveal-title -->` | 제목 공개 + 이미지 |
| outro | `<!-- step:outro -->` | 마무리 + 추천 버튼 |

### 구조 패턴 (10~14 스텝)

```
cinematic-hook → scene → dialogue → narration → impact →
scene → dialogue → narration → impact →
reveal-title → outro
```

### 예시 (시네마틱 스타일)

```mdx
<!-- step:cinematic-hook -->
1981년, MIT 강연장.
한 물리학자가 미친 아이디어를 내놓았다.
**"컴퓨터를 양자역학으로 만들자."**

<!-- step:scene -->
🎬 리처드 파인만.
노벨 물리학상 수상자.
기존 컴퓨터의 한계를 정확히 꿰뚫었다.

<!-- step:dialogue:feynman -->
"자연은 양자역학으로 돌아간다.
그럼 컴퓨터도 양자역학으로
만들어야 하지 않나?"

<!-- step:narration -->
📖 기존 컴퓨터는 0 아니면 1.
한 번에 하나만 계산한다.
이걸 **비트**라 부른다.

<!-- step:impact -->
⚡ 양자 컴퓨터의 **큐비트**는
0과 1을 **동시에** 가진다.
이걸 중첩이라 한다.

<!-- step:reveal-title -->
💻 양자 컴퓨터
0과 1을 동시에 다루는 컴퓨터.

<!-- step:outro -->
아직 극저온에서만 작동한다.
하지만 **컴퓨팅의 다음 장**은 이미 열렸다.
```

---

## 방식 B: 만화 스타일 (신규)

대화/인물 중심. panel(다인 대화), splash(강조) 스텝으로 만화적 연출.

### 추가 스텝 타입

| 스텝 | 문법 | 용도 |
|------|------|------|
| panel | `<!-- step:panel -->` | 다인 대화. 한 페이지에 여러 캐릭터 대사 |
| splash | `<!-- step:splash -->` | 만화 스플래시. 스피드라인 + 대형 텍스트 강조 |

### panel 문법

```
캐릭터id: 대사 텍스트
캐릭터id: 대사 텍스트
캐릭터id: **강조 대사**
```

- 첫 번째 화자 → 좌측, 두 번째 화자 → 우측 (자동 배치)
- `**볼드**` 지원

### splash 문법

```
💥 큰 이모지 + 핵심 문장
보조 설명 텍스트
추가 설명...
```

- 첫 줄 = 대형 hero text (이모지 자동 감지)
- 스피드라인 + 방사형 버스트 애니메이션

### 구조 패턴 (12~16 스텝)

```
cinematic-hook → splash → panel → narration →
scene → splash → panel → narration →
panel → scene → dialogue →
splash → dialogue →
reveal-title → outro
```

### 특징
- **characters** 필수 (2~4명)
- panel/splash를 최소 각 2회 이상 사용
- dialogue와 panel 혼용으로 독백/대화 자유 전환
- splash는 감정적 절정, 반전, 충격 장면에 사용

### 예시 (만화 스타일)

```mdx
<!-- step:cinematic-hook -->
달까지 33만 km.
산소탱크가 **폭발**했다.
3명의 우주비행사.
**돌아올 방법은 없었다.**

<!-- step:splash -->
💥 산소탱크 2번, 폭발.
1970년 4월 13일.
지구에서 **32만 km** 떨어진 우주.

<!-- step:panel -->
swigert: 휴스턴, 문제가 생겼습니다.
lovell: 창밖을 봐. 산소가 새고 있어.
swigert: …전력이 떨어지고 있어.
lovell: **우리 산소가 사라지고 있다.**

<!-- step:narration -->
📖 전력은 **15%**로 급감.
산소는 수 시간 내 고갈.
난방이 꺼지고 기내 온도가 **3°C**까지 떨어졌다.

<!-- step:splash -->
👨‍💼 "실패는 선택지에 없습니다."
진 크랜츠, 아폴로 13호 비행 책임자.

<!-- step:panel -->
haise: CO₂ 농도가 올라가고 있어.
lovell: 필터는?
haise: **모양이 안 맞아.** 사령선은 원형, 착륙선은 사각형.
lovell: …그럼 우리가 만들어야지.

<!-- step:reveal-title -->
🚀 아폴로 13호의 귀환
달에 가지 못한 미션이
역사상 가장 위대한 **귀환**이 되었다.

<!-- step:outro -->
**"성공한 실패."**
양말과 테이프로 목숨을 건진 이야기.
```

---

## 방식 C: 리듬형 스타일 (v4 신규 — 2026)

빠른 비트와 느린 비트를 교차해 읽기 리듬을 만드는 방식.
`fact` / `cliffhanger` / `data-viz` 를 핵심 리듬 구간으로 활용.

### 신규 스텝 타입 (v4)

| 스텝 | 문법 | 용도 | 리듬 |
|------|------|------|------|
| fact | `<!-- step:fact -->` | 단일 팩트 드롭. 짧고 강렬한 한 줄 사실 | Quick Beat |
| cliffhanger | `<!-- step:cliffhanger -->` | 다음 스텝 궁금증 유발. "그런데..." 형식 전환점 | Transition Beat |
| data-viz | `<!-- step:data-viz -->` | 숫자를 카운트업 애니메이션으로 시각화 | Slow Beat |

### fact 문법

```
핵심 사실을 한 줄로. 짧고 강렬하게.
선택적 보조 설명 (두 번째 줄부터)
```

- 첫 줄: 강렬한 단일 팩트 (10~20자 권장)
- 이후 줄: 보조 설명 (선택, 1~2줄)
- 배경: 어두운 단색, 좌측 컬러 수직 라인
- 전환 애니메이션: instant snap (0.05s) — 빠른 리듬 효과

### cliffhanger 문법

```
그런데... / 그 결과는? / 아무도 몰랐다.
(미완성 느낌의 전환점 문장)
```

- 하단 "..." 애니메이션 자동 추가
- "다음 장에서 밝혀집니다" 힌트 자동 표시
- 배경: 카테고리 색상 그라데이션
- 전환 애니메이션: instant snap (0.05s)

### data-viz 문법

```
숫자값 | 레이블
설명 텍스트 (선택)
```

예시:
```
3,200만명 | 한국의 스마트폰 사용자
전 세계 인구의 약 6%에 해당한다
```

- 숫자: 0에서 목표값까지 카운트업 애니메이션 (isActive 시 자동 시작)
- 단위 자동 감지: %, 명, 억, 만, kg, km 등
- 통화 기호 자동 감지: $, €, ¥, ₩
- 소수점 지원: "98.6%" → 98.6까지 카운트업
- 레이블/설명이 없어도 동작

### 구조 패턴 (v4 리듬형, 10~14 스텝)

```
cinematic-hook → fact → narration → cliffhanger →
scene → data-viz → fact → narration →
impact → cliffhanger →
reveal-title → outro
```

### v4 전환 애니메이션 매핑

| 스텝 타입 | 전환 효과 | 속도 |
|-----------|-----------|------|
| fact, cliffhanger | instant snap | 0.05s |
| cinematic-hook, impact, splash | scale zoom | 0.25s |
| reveal-title | dramatic fade | 0.5s |
| 나머지 | crossfade y±4 | 0.15s |

---

## 작성 규칙

1. **한국어** 작성. 모든 콘텐츠는 한국어.
2. **pubDate**: 2026-02-15 이하 (미래 날짜 금지)
3. **slug**: 파일명이 곧 slug (영문 kebab-case)
4. **스텝 수**: 10~16개 사이
5. **reveal-title**: 항상 마지막 2번째. `{emoji} {title}` + 한 줄 설명
6. **outro**: 항상 마지막. 여운 남기는 마무리
7. **cinematic-hook**: 항상 첫 번째. 강렬한 첫인상
8. **텍스트**: 짧은 문장. 한 줄 5~15자. `**볼드**`로 핵심 강조
9. **방식 선택**: 인물 대화 중심 → 만화 / 개념/팩트 중심 → 시네마틱
10. **coverImage**: 선택사항. 있으면 reveal-title에서 정사각 프레임 표시
