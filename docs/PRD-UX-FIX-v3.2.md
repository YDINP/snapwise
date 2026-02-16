# PRD: SnapWise v3.2 UX 6대 이슈 수정

## 1. 개요

SnapWise의 실사용 테스트에서 발견된 6가지 UX 이슈를 수정한다.
핵심 목표: **눈의 피로 감소, 가독성 향상, 시각적 완성도 개선**

## 2. 이슈 목록

| ID | 이슈 | 심각도 |
|----|------|--------|
| UX-1 | 글씨가 카드 하단에서 겹쳐 보임 | P1 |
| UX-2 | 검은 화면에 아무 내용도 안 나옴 | P0 |
| UX-3 | 텍스트 줄바꿈 없이 한 덩어리 | P1 |
| UX-4 | 스텝 전환 시 전체 페이드아웃/인 → 눈 피로 | P0 |
| UX-5 | 카드 배경색이 너무 쨍해서 눈 피로 | P0 |
| UX-6 | 대사 스텝에 만화적 연출 부족 + 생성형 이미지 준비 | P2 |

---

## 3. 태스크별 상세 스펙

### TASK-1: 배경색 톤다운 (UX-5)

**파일**: `src/lib/categories.ts`

**현재 문제**: 채도 높은 그래디언트 (600~700 레벨) → 풀스크린에서 눈 피로

**변경 사항**: 모든 gradient를 어두운 톤(800~950)으로 교체

```
science:    from-emerald-600 to-teal-700     → from-emerald-900 to-teal-950
psychology: from-blue-600 to-indigo-700      → from-slate-800 to-indigo-950
people:     from-amber-500 to-yellow-600     → from-amber-900 to-yellow-950
history:    from-stone-600 to-amber-800      → from-stone-800 to-stone-950
life:       from-orange-500 to-red-500       → from-orange-900 to-rose-950
business:   from-violet-600 to-purple-700    → from-violet-900 to-purple-950
culture:    from-rose-500 to-pink-600        → from-rose-900 to-pink-950
origins:    from-cyan-600 to-blue-700        → from-cyan-900 to-blue-950
```

**accent 색상은 유지** (UI 요소용이므로 밝은 톤 필요)

---

### TASK-2: 스텝 전환 애니메이션 수정 (UX-4)

**파일**: `src/components/feed/StoryCard.tsx`

**현재 문제**:
```tsx
// 현재 코드 — 매 스텝마다 전체 opacity 0→1→0 (배경까지 깜빡임)
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
```

**해결**: 배경은 고정, 콘텐츠만 미세하게 전환
```tsx
// 변경 후 — 부드러운 슬라이드 + 미세 opacity
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0.6, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0.6, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
```

**핵심**: opacity 범위를 0.6~1로 좁혀서 깜빡임 최소화. 짧은 거리(8px) 슬라이드로 전환 인지.

---

### TASK-3: 줄바꿈 유틸 함수 + 전체 적용 (UX-3)

**신규 파일**: `src/lib/renderContent.tsx`

```tsx
import React from 'react';

export function renderWithLineBreaks(content: string): React.ReactNode {
  if (!content) return null;
  const lines = content.split('\n').filter(line => line.trim() !== '');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
```

**적용 대상 파일** (7개 컴포넌트에서 `{step.content}` → `{renderWithLineBreaks(step.content)}`):
- `src/components/cinematic/CinematicHook.tsx` (line 52)
- `src/components/cinematic/SceneStep.tsx` (line 31)
- `src/components/cinematic/DialogueStep.tsx` (line 55)
- `src/components/cinematic/NarrationStep.tsx` (line 29)
- `src/components/cinematic/ImpactStep.tsx` (line 40)
- `src/components/cinematic/RevealTitleStep.tsx` (line 59 — subtitle 파싱 후)
- `src/components/cinematic/OutroStep.tsx` (line 33)

**RevealTitleStep 특이사항**: 현재 `step.content.split('\n')[0]`으로 첫 줄만 사용 → 나머지 줄도 표시되도록 개선

---

### TASK-4: SceneStep 텍스트 위치 수정 (UX-1)

**파일**: `src/components/cinematic/SceneStep.tsx`

**현재 문제**:
```tsx
// items-end + pb-20 → 텍스트가 하단에 위치, 겹쳐 보임
<div className="relative flex h-full w-full items-end overflow-hidden pb-20">
```

**변경**: 중앙 정렬로 통일
```tsx
<div className="relative flex h-full w-full items-center justify-center overflow-hidden">
```

**하단 그래디언트 오버레이 제거** (더 이상 하단 텍스트 아니므로 불필요):
```tsx
// 삭제: <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
```

대신 전체 반투명 오버레이로 교체 (가독성 유지):
```tsx
<div className="absolute inset-0 bg-black/20" />
```

---

### TASK-5: CinematicRenderer 빈 화면 방지 (UX-2)

**파일**: `src/components/cinematic/CinematicRenderer.tsx`

**현재 문제**: default case에 NarrationStep fallback 있음 → 그런데도 검은 화면 발생
- **원인 추정**: `step.content`가 빈 문자열 or DialogueStep에서 `character`를 못 찾으면 `return null`

**변경 사항**:

1. DialogueStep에서 character 못 찾을 때 fallback:
```tsx
// 현재: if (!character) return null;
// 변경: fallback 캐릭터 사용
const character = card.characters?.find(c => c.id === step.characterId)
  ?? { id: 'unknown', name: '화자', emoji: '💬' };
```

2. 빈 content 방어 (CinematicRenderer에서):
```tsx
// step.content가 비어있으면 안전한 텍스트 삽입
const safeStep = {
  ...step,
  content: step.content?.trim() || '...'
};
```

---

### TASK-6: DialogueStep 만화 스타일 리디자인 (UX-6)

**파일**: `src/components/cinematic/DialogueStep.tsx`, `src/types/content.ts`

**타입 확장** (content.ts):
```tsx
export interface Character {
  id: string;
  name: string;
  emoji: string;
  image?: string;  // 추가: 생성형 이미지 URL
}
```

**DialogueStep 리디자인**:

1. **캐릭터 아바타 영역**:
   - `character.image`가 있으면 `<img>` 렌더 (둥근 테두리 + 그림자)
   - 없으면 기존 이모지 아바타 (크기 키움: h-14→h-16)
   - 캐릭터 이름에 볼드 + 약간 큰 폰트

2. **말풍선 만화 스타일**:
   - 배경: `bg-white/15` → `bg-white/90 text-gray-900` (밝은 배경 + 어두운 글씨 = 가독성↑)
   - 테두리: `border-2 border-white` (만화적 테두리)
   - 그림자: `shadow-lg` (깊이감)
   - 꼬리: 더 크고 뚜렷한 삼각형
   - 모서리: `rounded-2xl` → `rounded-xl rounded-tl-sm` (말풍선 특유의 비대칭 모서리)

3. **레이아웃**:
   - 아바타와 말풍선 사이 갭 유지
   - 말풍선 최대 너비 제한 (80%)

---

## 4. 구현 순서 및 의존성

```
TASK-1 (배경색)      ← 독립, 먼저 적용
TASK-2 (애니메이션)   ← 독립
TASK-3 (줄바꿈 유틸)  ← 독립, but TASK-4~6이 이 유틸 사용
TASK-4 (SceneStep)   ← TASK-3 이후
TASK-5 (빈 화면)     ← 독립
TASK-6 (DialogueStep) ← TASK-3 이후
```

**병렬화**: TASK-1, TASK-2, TASK-3, TASK-5는 동시 진행 가능.
TASK-4, TASK-6는 TASK-3 (renderContent 유틸) 완료 후 진행.

## 5. 검증 체크리스트

- [ ] `npm run build` 에러 없음
- [ ] 모든 step type 렌더링 정상 (cinematic-hook, scene, dialogue, narration, impact, reveal-title, outro)
- [ ] 줄바꿈 정상 적용 확인
- [ ] 스텝 전환 시 깜빡임 없이 부드러운 전환
- [ ] 배경색 톤다운 확인 (눈 편안한지)
- [ ] DialogueStep에 character 없는 카드에서 검은 화면 없음
- [ ] 말풍선 만화 스타일 적용 확인
- [ ] Vercel 배포 후 모바일 실기기 테스트
