# CLAUDE.md — SnapWise (shortform-blog)

## Language Preference
- 한국어로 응답할 것

## Project Overview
- **프로젝트명**: SnapWise
- **설명**: 심리학·과학·역사·비즈니스 개념을 시네마틱 스토리카드로 전달하는 숏폼 블로그
- **기술 스택**: Next.js 15 / React 19 / TypeScript / Tailwind CSS / MDX
- **카드 포맷 규격**: `CARD_FORMAT_SPEC.md`
- **PRD**: `docs/PRD.md`

## 디렉토리 구조

```
shortform-blog/
├── content/          # MDX 카드 파일 (카테고리별 폴더)
│   ├── psychology/
│   ├── science/
│   ├── history/
│   ├── business/
│   ├── culture/
│   ├── life/
│   ├── people/
│   ├── origins/
│   └── etc/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # UI 컴포넌트
│   ├── hooks/        # 커스텀 훅
│   ├── lib/          # 유틸리티
│   └── types/        # TypeScript 타입
├── docs/             # PRD, 스타일 가이드
└── CARD_FORMAT_SPEC.md  # 카드 포맷 규격서
```

## 카테고리 (9개)

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

## 개발 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 멀티 에이전트 시스템

이 프로젝트는 `.claude/agents/` + `.claude/commands/`를 공유합니다.
(YD_Claude_RND/.claude/ 와 Junction으로 연결됨)

### 카드 생성 전용 커맨드

```
/create-card {주제} {카테고리}    # 단일 카드 생성
/card-batch {N}개 {카테고리}      # 대량 배치 생성
```

### 기능 개발 전용 커맨드

```
/pt "{구현할 기능}"               # 멀티 에이전트 팀 구성
```

### 주요 에이전트

| 에이전트 | 용도 |
|---------|------|
| `card-scenario` | MDX 카드 시나리오 작성 |
| `mdx-validator` | MDX 구조 검증 |
| `card-batch-runner` | 대량 카드 생산 오케스트레이션 |
| `designer` | UI 컴포넌트 (Tailwind + Next.js) |
| `executor` | 기능 구현, 버그 수정 |
| `qa-tester` | 테스트 작성, 검증 |

## 카드 작성 원칙

- **스토리 우선**: 사실 나열이 아닌 허구 시나리오로 개념 전달
- **시네마틱 연출**: step 타입으로 장면 전환 (cinematic-hook → scene → dialogue → ...)
- **한국어**: 모든 카드는 한국어로 작성
- **카드당 스텝 수**: 8~15개 (최소 8개)
- **포맷 규격**: `CARD_FORMAT_SPEC.md` 준수 필수
