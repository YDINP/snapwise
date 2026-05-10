import type { CardMeta, CardStep, CategoryKey } from '../../src/types/content';

/**
 * SnapWise 비주얼 프롬프트 시스템 v3
 * 컨셉: "Manga Editorial" — 만화/애니메이션 + 텍스트 포함 포스터 스타일
 *
 * 변경점 (v2 → v3):
 *  - dialogue 스텝 추가: 만화 캐릭터 + 말풍선
 *  - impact/showcase/reveal-title: 텍스트 포함 포스터 스타일
 *  - 영문 슬러그 키워드를 메인 컨텍스트로 (한국어보다 AI 이해 우수)
 *  - 텍스트 회피 → 의도적 영문 키워드 포함
 */

const STYLE_BASE = `Manga and anime illustration style, vibrant colors,
warm amber (#D97706) accent palette, expressive linework,
dynamic composition, polished anime aesthetic`;

const NEGATIVE_COMMON = `low quality, blurry, distorted, watermark, signature,
broken text, garbled letters, illegible scribbles, oversaturated`;

const CATEGORY_TONES: Record<CategoryKey, string> = {
  science: 'sci-fi anime style, lab equipment, data visualization',
  psychology: 'surreal anime style, abstract mind concepts, dreamy atmosphere',
  people: 'classical manga portrait style, dramatic lighting',
  history: 'historical manga style, period-accurate setting',
  koreanhistory: 'Korean traditional manhwa style, hanok, historical attire',
  business: 'business manga style, modern office setting',
  culture: 'cultural manga style, traditional patterns and motifs',
  life: 'slice-of-life anime style, everyday warmth',
  origins: 'archaeology adventure manga style, ancient mystery',
  etc: 'editorial manga style, conceptual',
  tmi: 'quirky comedic anime style, exaggerated expressions',
  ocean: 'underwater fantasy manga style, marine life',
  space: 'space opera manga style, cosmic scenery',
  body: 'medical manga style, anatomical illustration',
};

function clean(content: string, max = 180): string {
  return content
    .replace(/\*\*/g, '')
    .replace(/!!/g, '')
    .replace(/—/g, '-')
    .replace(/[""]/g, '"')
    .replace(/\n+/g, ' ')
    .replace(/[^\s\w가-힣.,!?'"-]/g, '')
    .trim()
    .slice(0, max);
}

/** slug에서 영문 키워드 추출 (예: "barnum-effect" → "barnum effect") */
function slugKeywords(slug: string): string {
  return slug.replace(/-/g, ' ').toUpperCase();
}

/** 영문 짧은 키워드 (이미지 텍스트 영역용) */
function shortLabel(slug: string): string {
  return slug.replace(/-/g, ' ').toUpperCase().slice(0, 18);
}

function topicContext(card: CardMeta): string {
  const tags = (card.tags ?? []).slice(0, 3).join(', ');
  return `Card topic: "${card.title}" / English keyword: "${slugKeywords(card.slug)}"${tags ? ` / themes: ${tags}` : ''}`;
}

export interface PromptResult {
  key: string;
  prompt: string;
  width: number;
  height: number;
  seed: number;
}

/**
 * Hook — 카드 첫인상. 만화 표지 스타일.
 */
export function buildHookPrompt(card: CardMeta, hookContent: string): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
Visual: manga book cover style hero illustration depicting "${slugKeywords(card.slug)}".
Scene to suggest: ${clean(hookContent, 120)}.
Composition: dramatic centered hero, vibrant colors, eye-catching cover art.
Avoid: ${NEGATIVE_COMMON}.`;
  return {
    key: 'hook',
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'hook-v3'),
  };
}

/**
 * Thumbnail — 작은 아이콘 형태. 카드 리스트용.
 */
export function buildThumbnailPrompt(card: CardMeta): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
Single iconic anime/manga style illustration representing "${slugKeywords(card.slug)}".
Composition: square, centered, app-icon style, instantly recognizable.
Avoid: ${NEGATIVE_COMMON}, text, letters.`;
  return {
    key: 'thumbnail',
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'thumb-v3'),
  };
}

/**
 * Scene — 스토리 장면. 만화 패널 스타일.
 */
export function buildScenePrompt(card: CardMeta, step: CardStep, stepIndex: number): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
Manga panel illustration of this scene: ${clean(step.content, 150)}.
Composition: cinematic manga panel, atmospheric, narrative storytelling moment.
Style: clean anime linework, expressive, polished.
Avoid: ${NEGATIVE_COMMON}, broken text.`;
  return {
    key: `scene-${stepIndex}`,
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'scene-v3' + stepIndex),
  };
}

/**
 * Dialogue — 만화 캐릭터가 말하는 장면. 말풍선 포함.
 */
export function buildDialoguePrompt(card: CardMeta, step: CardStep, stepIndex: number): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const character = card.characters?.find(c => c.id === step.characterId);
  const characterDesc = character ? `Character: ${character.name} ${character.emoji}.` : '';

  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
${characterDesc}
Manga style illustration: a single anime character actively speaking with an expressive empty speech bubble.
Pose: dynamic dialogue gesture, expressive face, half-body framing.
Composition: character on one side, large speech bubble on the other side (LEAVE BUBBLE EMPTY for text overlay).
Style: clean anime/manga line art with screentone shading.
Avoid: ${NEGATIVE_COMMON}, text inside bubble, words inside bubble, multiple characters.`;
  return {
    key: `dialogue-${stepIndex}`,
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'dialogue-v3' + stepIndex),
  };
}

/**
 * Impact — 임팩트 포스터. 텍스트 포함 (영문 키워드).
 */
export function buildImpactPrompt(card: CardMeta, step: CardStep, stepIndex: number): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
Bold manga poster style illustration with stylized typography text "${shortLabel(card.slug)}".
Concept to symbolize: ${clean(step.content, 120)}.
Composition: dramatic centered hero illustration, large bold English title text integrated in design,
movie poster aesthetic, anime cover art.
Style: vibrant manga poster, dynamic composition, cinematic.
Avoid: ${NEGATIVE_COMMON}, broken letters, garbled text. The text "${shortLabel(card.slug)}" must be clearly readable.`;
  return {
    key: `impact-${stepIndex}`,
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'impact-v3' + stepIndex),
  };
}

/**
 * Showcase — 정보 포스터. 카테고리 레이블 포함.
 */
export function buildShowcasePrompt(card: CardMeta, step: CardStep, stepIndex: number): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
Educational manga infographic poster about "${slugKeywords(card.slug)}".
Content to visualize: ${clean(step.content, 200)}.
Composition: vertical info-poster layout with multiple illustrated sections,
each section showing a different aspect or example, like a manga study chart.
Style: anime educational poster, organized visual sections, vibrant.
Avoid: ${NEGATIVE_COMMON}.`;
  return {
    key: `showcase-${stepIndex}`,
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'showcase-v3' + stepIndex),
  };
}

/**
 * RevealTitle — 카드 타이틀 공개. 영문 타이틀 텍스트 포함.
 */
export function buildRevealTitlePrompt(card: CardMeta, content: string): PromptResult {
  const tone = CATEGORY_TONES[card.category] ?? '';
  const prompt = `${STYLE_BASE}, ${tone}.
${topicContext(card)}.
Movie poster style anime illustration for "${slugKeywords(card.slug)}".
Subtitle context: ${clean(content, 100)}.
Composition: hero centered illustration with LARGE BOLD English title text "${shortLabel(card.slug)}" prominently displayed,
movie poster aesthetic, dramatic lighting, manga cover art.
Style: cinematic anime poster, bold title typography, eye-catching.
Avoid: ${NEGATIVE_COMMON}, broken letters, garbled text. The title "${shortLabel(card.slug)}" must be clearly readable.`;
  return {
    key: 'reveal-title',
    prompt,
    width: 1024,
    height: 1024,
    seed: hashSeed(card.slug + 'reveal-v3'),
  };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100000;
}
