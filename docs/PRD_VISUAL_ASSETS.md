# PRD — SnapWise 카드 비주얼 자산 시스템

**작성일:** 2026-05-11
**Phase 0 모델:** **Pollinations.ai (Flux)** — 무료 테스트 (인증 불필요)
**Phase 3+ 모델:** OpenAI **gpt-image-1** (GPT-Image 2.0 세대) — 전체 적용 시
**범위:** 카드 전체 370장의 시각화 가능한 모든 스텝
**생성 방식:** 빌드 타임 자동 정적 생성 (옵션 A 확정)
**목적:** 텍스트 기반 카드를 시네마틱 비주얼 카드로 진화 — 스텝별 핵심 장면을 AI 이미지로 시각화

---

## ⚡ 결정사항 (사용자 확정)

| 항목 | 결정 |
|------|------|
| 비주얼 범위 | **카드 전체 370장 + 모든 시각화 가능 스텝** |
| 생성 방식 | **자동 빌드 타임 정적 생성** |
| 초기 테스트 | **무료 모델 (Pollinations.ai Flux)** |
| 검증 후 전환 | **gpt-image-1 (유료, 품질 우선)** 검토

---

## 1. 배경 & 문제 정의

### 현재 한계
- SnapWise 카드 370개는 **텍스트 + 이모지 + 그라디언트 배경** 조합
- `cinematic-hook`, `scene`, `impact` 같은 시네마틱 스텝이 사실상 텍스트 오버레이
- TikTok/Instagram Reels와 비교 시 **시각 임팩트 부족**

### 기회
- gpt-image-1: 텍스트→이미지 일관성·품질 우수, API로 자동화 가능
- 카드별 1~3장의 핵심 비주얼만 추가해도 체류시간·완독률 상승 기대
- 카테고리별 톤 일관성을 프롬프트로 강제 가능

---

## 2. 목표 (KPI)

| 지표 | 현재 | 목표 |
|------|------|------|
| 평균 카드 완독률 | 측정 미흡 | 70%+ |
| 평균 카드 체류시간 | ~30초 추정 | 50초+ |
| 카드별 좋아요 수 | 평균 1.x | 평균 3.x |
| 시각 자산 적용 카드 | 0 / 370 | **MVP 50장 → 전체 370장** |

---

## 3. 스텝 타입별 비주얼 정책

| 스텝 타입 | 비주얼 적용 | 스타일 |
|-----------|------------|--------|
| `cinematic-hook` | ✅ 필수 | 시네마틱 와이드, 영화 스틸컷 톤 |
| `scene` | ✅ 권장 | 스토리 장면 묘사, 일러스트레이션 |
| `dialogue` | ⚠️ 옵션 | 캐릭터 클로즈업 (얼굴 정확도 한계) |
| `impact` | ✅ 권장 | 추상/상징적 비주얼 (개념 강조) |
| `reveal-title` | ✅ 권장 | 타이틀 카드용 미니멀 비주얼 |
| `narration` | ❌ 불필요 | 텍스트 중심 유지 |
| `outro` | ✅ 권장 | 카드 요약 비주얼 (썸네일 활용) |
| `vs` | ⚠️ 옵션 | 좌/우 대비 일러스트 2장 |
| `stat` | ❌ 불필요 | 차트/숫자 중심 |
| `quote` | ⚠️ 옵션 | 배경 분위기 이미지 |
| `fact` | ⚠️ 옵션 | 단일 상징 비주얼 |

**MVP 우선순위:** `cinematic-hook` + `outro` (썸네일) → 카드 강한 첫인상 + 마무리

---

## 4. 무료 모델 비교 (Phase 0 테스트용)

| 서비스 | 모델 | 비용 | 인증 | 한도 | 품질 | 추천도 |
|--------|------|------|------|------|------|--------|
| **Pollinations.ai** | Flux | **무료** | 불필요 | 사실상 무제한 | ⭐⭐⭐⭐ | ✅ **1순위** |
| Cloudflare Workers AI | flux-1-schnell | 무료 | API 키 | 10K req/day | ⭐⭐⭐⭐ | 2순위 |
| Hugging Face Inference | FLUX.1-dev | 무료 (rate limited) | 토큰 | 분당 제한 | ⭐⭐⭐⭐⭐ | 3순위 |
| Together AI | FLUX.1-schnell | $1 크레딧 | API 키 | 크레딧 한도 | ⭐⭐⭐⭐ | 백업 |
| Replicate | SDXL/Flux | 무료 크레딧 | API 키 | 시간당 제한 | ⭐⭐⭐⭐ | 백업 |

### 4.1 Pollinations.ai 사용법
```typescript
// URL 기반 — fetch만으로 이미지 받기
const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
  `?model=flux&width=1024&height=1536&seed=${seed}&nologo=true&enhance=true`;
const res = await fetch(url);
const buffer = await res.arrayBuffer();
```
- **장점:** 인증 없음, GET 요청만으로 즉시, seed로 재현성, nologo 옵션
- **모델:** flux (default), flux-realism, flux-anime, turbo
- **단점:** 가끔 throttling, 응답 시간 5~15초

### 4.2 비용 비교 (370장 × hook+thumbnail = 740장)
| 서비스 | 740장 비용 |
|--------|-----------|
| **Pollinations.ai** | **$0** ✅ |
| Cloudflare AI | $0 (무료 티어 내) |
| gpt-image-1 medium | $31 |
| gpt-image-1 high | $124 |

**전략:** Pollinations.ai로 **전체 370장 무료 생성** → 품질 미흡 카드만 gpt-image-1로 재생성 (예산 효율)

---

## 5. gpt-image-1 사양 & 비용 (Phase 3+ 옵션)

### API 사양
- **모델 ID:** `gpt-image-1`
- **해상도:** 1024×1024, 1024×1536 (세로), 1536×1024 (가로)
- **품질:** low / medium / high
- **포맷:** PNG, WebP, JPEG
- **편집:** 마스크 기반 인페인팅 가능

### 비용 (1024×1024 기준)
| Quality | 가격 | 용도 |
|---------|------|------|
| low | $0.011 | 프리뷰/미리보기 |
| medium | $0.042 | **일반 카드 (권장)** |
| high | $0.167 | 메인 비주얼/cinematic-hook |

### MVP 비용 추정
- 50장 × 2이미지(hook + outro 썸네일) × medium = 100장 × $0.042 = **$4.2**
- 전체 370장 동일 적용 = 740장 × $0.042 = **$31** (1회성)
- high quality 적용 시: $124 (1회성)

---

## 5. 시스템 아키텍처

### 5.1 생성 파이프라인 (3가지 옵션)

#### 옵션 A: 빌드 타임 정적 생성 (권장)
```
content/{category}/{slug}.mdx
  ↓ (script: scripts/generate-card-visuals.ts)
public/visuals/{slug}/{step-id}.webp
  ↓
Next.js SSG 빌드 시 정적 자산으로 포함
```
- ✅ 런타임 비용 없음, CDN 캐싱
- ✅ Vercel 배포 시 자동 포함
- ❌ 카드 추가/수정 시 재생성 스크립트 필요

#### 옵션 B: 런타임 생성 + Supabase Storage 캐싱
```
첫 요청 → gpt-image-1 호출 → Supabase Storage 저장 → URL 반환
이후 요청 → Supabase URL 직접 반환
```
- ✅ 동적 콘텐츠 대응
- ❌ 첫 요청 지연 (5~10초), API 키 노출 위험

#### 옵션 C: 하이브리드 (옵션 A + 수동 트리거)
- 카드 작성 후 admin endpoint(`/api/generate-visuals?slug=...`)로 수동 생성
- 결과를 git commit으로 정적 자산화
- ✅ 비용 통제, 품질 검수 가능

**권장: 옵션 A** (빌드 타임 정적 생성)

### 5.2 디렉토리 구조 (옵션 A)
```
shortform-blog/
├── scripts/
│   ├── generate-card-visuals.ts      # 메인 생성 스크립트
│   ├── prompts/
│   │   ├── cinematic-hook.ts         # 스텝 타입별 프롬프트
│   │   ├── scene.ts
│   │   ├── impact.ts
│   │   └── outro-thumbnail.ts
│   └── lib/
│       ├── openai-client.ts          # gpt-image-1 클라이언트
│       └── image-optimizer.ts        # WebP 변환·리사이즈
├── public/
│   └── visuals/
│       └── {slug}/
│           ├── hook.webp             # 1024×1536 세로
│           ├── thumbnail.webp        # 1024×1024 정사각
│           └── manifest.json         # 메타 (모델, 프롬프트, 생성일)
└── content/
    └── {category}/{slug}.mdx          # frontmatter에 visualVersion: "1.0"
```

---

## 6. 프롬프트 템플릿 시스템

### 6.1 스타일 토큰 (모든 프롬프트 공통 prefix)
```
Style: Cinematic editorial illustration, warm amber lighting,
soft film grain, 35mm photography aesthetic, muted earth tones with
amber (#D97706) and deep brown accents, painterly digital art,
high contrast, depth of field, no text, no watermark.
```

### 6.2 카테고리별 톤
| 카테고리 | 톤 |
|---------|---|
| science | clean lab aesthetic, microscopic textures, blue-amber duotone |
| psychology | introspective, dim warm lighting, surreal subtle |
| people | classical portrait painting, museum-quality, chiaroscuro |
| history | aged sepia, parchment textures, period-accurate |
| business | minimalist editorial, glass morphism, abstract financial |
| culture | vibrant ethnic motifs, traditional patterns, warm |
| life | candid daily moments, golden hour lighting |

### 6.3 스텝별 프롬프트 변환
```typescript
// scripts/prompts/cinematic-hook.ts
export function buildHookPrompt(card: CardMeta, hookContent: string) {
  return `${STYLE_PREFIX}
${CATEGORY_TONES[card.category]}

Scene: ${hookContent.replace(/\*\*/g, '')}

Composition: vertical 9:16, subject centered with negative space at bottom
for text overlay, dramatic backlighting, mysterious atmosphere.

Avoid: text, letters, watermarks, modern UI elements, low quality, distorted faces.`;
}
```

### 6.4 프롬프트 안전 가드
- 인물 사진(historical figures) → 추상화/실루엣 처리
- 폭력/민감 주제 → 은유적 표현 (예: 전쟁 → 빈 들판)
- 저작권 캐릭터 → 일반화

---

## 7. 컴포넌트 통합

### 7.1 MDX frontmatter 확장
```yaml
---
title: 파블로프의 개
category: psychology
visuals:
  hook: /visuals/pavlovs-dog/hook.webp
  thumbnail: /visuals/pavlovs-dog/thumbnail.webp
  scenes:
    - step: 3
      src: /visuals/pavlovs-dog/scene-3.webp
visualVersion: "1.0"
---
```

### 7.2 CinematicHook.tsx 비주얼 통합
```tsx
{card.visuals?.hook && (
  <Image
    src={card.visuals.hook}
    alt=""
    fill
    priority={isActive}
    className="object-cover opacity-70"
    sizes="(max-width: 768px) 100vw, 768px"
  />
)}
```
- 기존 카테고리 그라디언트 위에 이미지 오버레이
- 텍스트 가독성 위해 추가 다크 그라디언트 (existing `step-overlay-dark`)

### 7.3 카드 썸네일 (saved 페이지, 카드 리스트)
- `/visuals/{slug}/thumbnail.webp` 정사각 사용
- 기존 이모지+그라디언트 fallback 유지

---

## 8. 단계별 도입 로드맵

### Phase 0 — 무료 테스트 ⚡ **최우선**
- [x] Pollinations.ai 모델 선정
- [ ] 인프라 스크립트 구축 (T12)
- [ ] 1장 샘플 카드로 hook+thumbnail 생성 (T13)
- [ ] 결과 품질 검수 → Go/No-Go 결정

### Phase 1 — 인프라 확장 (1주)
- [ ] OpenAI API 키 등록 + 환경변수 (`OPENAI_API_KEY`)
- [ ] `scripts/generate-card-visuals.ts` 스크립트 작성
- [ ] 프롬프트 템플릿 시스템 (스타일 prefix + 카테고리 톤)
- [ ] WebP 변환·최적화 파이프라인 (sharp lib)
- [ ] frontmatter `visuals` 필드 타입 정의 (`src/types/content.ts`)

### Phase 2 — MVP (2주)
- [ ] 5개 카테고리 × 2장 = **10장 시범 생성**
- [ ] CinematicHook.tsx에 비주얼 통합 (옵션 적용)
- [ ] A/B 테스트: 비주얼 vs 텍스트만 카드 비교
- [ ] 사용자 피드백 수집

### Phase 3 — 전체 적용 (3주)
- [ ] 370장 hook 비주얼 일괄 생성 (~$15 예산)
- [ ] outro 썸네일 생성 (~$15)
- [ ] 카드 페이지 OG 이미지로도 활용 (SEO 개선)
- [ ] saved 페이지 카드 썸네일 교체

### Phase 4 — 고급 기능 (4주+)
- [ ] scene 스텝 비주얼 (선택 카드만)
- [ ] vs 스텝 양쪽 비주얼
- [ ] 시즌별/이벤트 테마 비주얼 변형
- [ ] 사용자 스타일 선호 옵션 (사실적/일러스트/3D)

---

## 9. 운영 고려사항

### 9.1 비용 통제
- 환경변수 `VISUAL_GENERATION_BUDGET_USD=50` 으로 상한 설정
- 스크립트 실행 시 누적 토큰/비용 출력
- `--dry-run` 플래그로 프롬프트만 검증

### 9.2 품질 관리
- 생성 후 `manifest.json`에 프롬프트·모델·생성일 저장
- 부적합 이미지는 `--regenerate {slug}` 로 재생성
- 카테고리별 샘플 5장 검수 후 일괄 생성

### 9.3 라이선스
- gpt-image-1 생성물은 OpenAI Usage Policy 준수
- 상업적 사용 가능 (OpenAI 정책상 허용)
- 메타데이터에 "AI-generated" 명시 (투명성)

### 9.4 성능
- 이미지 lazy loading (Next.js `Image`)
- WebP 우선, AVIF 옵션 검토
- 모바일 1024px 너비 충분 → 1024×1536 원본

### 9.5 캐시 무효화
- `visualVersion` 필드 변경 시 재생성
- 카드 본문 변경 시 자동 재생성하지 않음 (수동 트리거)

---

## 10. 위험 요인 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| API 비용 초과 | 중 | 빌드 타임 단발 생성, dry-run, 예산 상한 |
| 부적합 이미지 (인물·폭력) | 중 | 프롬프트 가드, 카테고리별 검수 |
| 생성 실패/지연 | 저 | 빌드 타임 처리이므로 영향 없음 |
| 한국 문화 이미지 정확도 | 중 | 한국사·문화 카테고리는 별도 프롬프트 |
| 저작권 분쟁 | 저 | OpenAI 정책 준수, "AI 생성" 명시 |
| 디자인 일관성 | 중 | 스타일 토큰 prefix 강제, 샘플 검수 |

---

## 11. 결정 필요 사항

다음 항목들은 사용자 결정 필요:

1. **품질 수준** — medium ($31 전체) vs high ($124 전체)?
2. **비주얼 우선순위** — hook만 / hook+outro / 전체 시네마틱?
3. **생성 방식** — 빌드 타임 자동(옵션 A) vs 수동 트리거(옵션 C)?
4. **예산** — Phase 1~3 총 예산 한도?
5. **MVP 카드 선정** — 어느 카테고리/카드부터?

---

## 12. 다음 액션

이 PRD 승인 후 진행:
1. OpenAI API 키 발급 (사용자 작업)
2. Phase 1 인프라 구축 (auto-pipeline 위임 가능)
3. 5장 샘플 생성 → 사용자 검수
4. 검수 통과 시 MVP 50장 일괄 생성

**예상 첫 비주얼 카드 시연: 인프라 구축 후 1~2일**
