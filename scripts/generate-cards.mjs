#!/usr/bin/env node

/**
 * SnapWise Auto Card Generator
 *
 * 주 3회(월/수/금) GitHub Actions에서 실행되어 카드를 자동 생성합니다.
 * Claude Haiku API로 MDX 카드 콘텐츠를 생성하고, content/{category}/ 에 저장합니다.
 *
 * 필요한 환경변수:
 *   ANTHROPIC_API_KEY - Claude API 키 (필수)
 *
 * 선택 환경변수:
 *   INPUT_CATEGORY       - 특정 카테고리 지정 (기본: auto)
 *   CARDS_PER_CATEGORY  - 카테고리당 생성 장수 (기본: 2, 총 11×2=22장)
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ─── Config ───────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const INPUT_CATEGORY = process.env.INPUT_CATEGORY || 'auto';
const CARDS_PER_CATEGORY = Math.min(parseInt(process.env.CARDS_PER_CATEGORY || '2', 10), 5);

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_DELAY_MS = 300; // rate limit 대비

const ALL_CATEGORIES = [
  'science', 'psychology', 'people', 'history', 'koreanhistory',
  'life', 'business', 'culture', 'origins', 'etc', 'tmi'
];

const VALID_STEP_TYPES = [
  'cinematic-hook', 'scene', 'dialogue', 'narration', 'impact',
  'vs', 'stat', 'quote', 'timeline', 'showcase', 'panel', 'splash',
  'reveal-title', 'outro'
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toSlug(text) {
  // 한국어 → 영문 슬러그 변환 (AI가 영문 slug를 제공하므로 보조용)
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/** 기존 content/ 에서 사용된 슬러그 목록 추출 */
function getExistingSlugs() {
  const contentDir = join(ROOT, 'content');
  const slugs = new Set();

  try {
    for (const category of ALL_CATEGORIES) {
      const catDir = join(contentDir, category);
      if (!existsSync(catDir)) continue;

      for (const file of readdirSync(catDir)) {
        if (file.endsWith('.mdx')) {
          slugs.add(basename(file, '.mdx'));
        }
      }
    }
  } catch {
    // 디렉토리 없으면 무시
  }

  return slugs;
}

/** 기존 카드 제목 목록 추출 (중복 주제 방지) */
function getExistingTitles() {
  const contentDir = join(ROOT, 'content');
  const titles = new Set();

  try {
    for (const category of ALL_CATEGORIES) {
      const catDir = join(contentDir, category);
      if (!existsSync(catDir)) continue;

      for (const file of readdirSync(catDir)) {
        if (!file.endsWith('.mdx')) continue;
        try {
          const content = readFileSync(join(catDir, file), 'utf-8');
          const match = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
          if (match) titles.add(match[1].trim());
        } catch {
          // 파일 읽기 실패 시 무시
        }
      }
    }
  } catch {
    // 무시
  }

  return titles;
}

/** 카테고리별 CARDS_PER_CATEGORY장씩 목록 생성 */
function selectCategories() {
  if (INPUT_CATEGORY !== 'auto') {
    // 특정 카테고리가 지정된 경우
    const cat = INPUT_CATEGORY.toLowerCase();
    if (ALL_CATEGORIES.includes(cat)) {
      return Array(CARDS_PER_CATEGORY).fill(cat);
    }
  }

  // 모든 카테고리 × CARDS_PER_CATEGORY (기본 11×2=22장)
  return ALL_CATEGORIES.flatMap(cat => Array(CARDS_PER_CATEGORY).fill(cat));
}

/** 씨앗 주제에서 미사용 주제 선택 — usedSeeds에 선택한 씨앗을 기록 */
function pickTopic(category, seeds, usedSeeds) {
  const available = seeds[category]?.filter(t => !usedSeeds.has(t)) || [];
  if (available.length === 0) {
    // 씨앗 소진 시 null 반환 → AI가 자유롭게 생성
    return null;
  }
  // 날짜 기반 결정론적 선택 (같은 실행 내 중복 방지는 usedSeeds가 담당)
  const idx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % available.length;
  const topic = available[idx];
  usedSeeds.add(topic);
  return topic;
}

// ─── YAML 직렬화 ─────────────────────────────────────────────────────────────

function yamlString(val) {
  if (typeof val !== 'string') return String(val);
  // 특수문자 포함 시 따옴표
  if (/[:#\[\]{}&*!|>'"%@`,]/.test(val) || val.includes('\n') || val.startsWith(' ') || val.endsWith(' ')) {
    return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return val;
}

function toFrontmatterYaml(obj) {
  const lines = [];

  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;

    if (typeof v === 'string') {
      lines.push(`${k}: ${yamlString(v)}`);
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      lines.push(`${k}: ${v}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) continue;

      if (typeof v[0] === 'string') {
        lines.push(`${k}:`);
        v.forEach(item => lines.push(`  - ${yamlString(item)}`));
      } else if (typeof v[0] === 'object') {
        lines.push(`${k}:`);
        v.forEach(item => {
          const entries = Object.entries(item);
          if (entries.length === 0) return;
          lines.push(`  - ${entries[0][0]}: ${yamlString(String(entries[0][1]))}`);
          entries.slice(1).forEach(([ek, ev]) => {
            lines.push(`    ${ek}: ${yamlString(String(ev))}`);
          });
        });
      }
    }
  }

  return lines.join('\n');
}

// ─── MDX 생성 ─────────────────────────────────────────────────────────────────

function buildMdxContent(frontmatter, steps) {
  const fm = toFrontmatterYaml(frontmatter);
  const body = steps
    .map(step => {
      const typeStr = step.characterId
        ? `${step.type}:${step.characterId}`
        : step.type;
      return `<!-- step:${typeStr} -->\n${step.content.trim()}`;
    })
    .join('\n\n');

  return `---\n${fm}\n---\n\n${body}\n`;
}

// ─── 검증 ─────────────────────────────────────────────────────────────────────

function validateCard(card) {
  const errors = [];
  const { frontmatter, steps, slug } = card;

  // frontmatter 필수 필드
  if (!frontmatter?.title) errors.push('title 누락');
  if (!frontmatter?.emoji) errors.push('emoji 누락');
  if (!frontmatter?.category) errors.push('category 누락');
  if (!Array.isArray(frontmatter?.tags) || frontmatter.tags.length === 0) errors.push('tags 누락');
  if (![1, 2, 3].includes(frontmatter?.difficulty)) errors.push('difficulty 오류');
  if (!slug) errors.push('slug 누락');

  // steps 검증
  if (!Array.isArray(steps) || steps.length < 8) {
    errors.push(`steps 부족 (${steps?.length ?? 0}개)`);
    return { valid: false, errors };
  }
  if (steps.length > 18) errors.push(`steps 과다 (${steps.length}개)`);

  // 첫/끝 순서
  if (steps[0]?.type !== 'cinematic-hook') errors.push('첫 스텝이 cinematic-hook이 아님');
  if (steps[steps.length - 1]?.type !== 'outro') errors.push('마지막 스텝이 outro가 아님');
  if (steps[steps.length - 2]?.type !== 'reveal-title') errors.push('끝에서 두 번째가 reveal-title이 아님');

  // 유효 타입 확인
  for (const step of steps) {
    if (!VALID_STEP_TYPES.includes(step.type)) {
      errors.push(`유효하지 않은 step 타입: ${step.type}`);
    }
    if (!step.content?.trim()) {
      errors.push(`빈 콘텐츠 step: ${step.type}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── 줄바꿈 정규화 ────────────────────────────────────────────────────────────

/**
 * 줄바꿈 없이 긴 단일행으로 생성된 step content를 문장 경계에서 분리합니다.
 * renderWithLineBreaks는 \n 기준으로 <br /> 삽입하므로 줄바꿈이 없으면 텍스트가 뭉침.
 *
 * 처리 기준:
 *  - 이미 \n이 있으면 통과
 *  - 80자 미만이면 통과
 *  - 문장 종결 부호(. ! ?) 뒤 공백 + 한국어/볼드 시작 → \n 삽입
 */
function normalizeLineBreaks(content) {
  if (!content || content.includes('\n')) return content;
  if (content.length <= 80) return content;

  return content
    // ". " / "! " / "? " 뒤에 한국어, 볼드(**), 따옴표("') 시작이면 줄바꿈
    .replace(/([.!?])\s+(?=[가-힣\*"'\[⚡📖🎬💥📊])/g, '$1\n')
    // "다 " / "요 " 등 한국어 종결어미 + 공백 + 한국어 시작이면 줄바꿈 (위에서 못 잡은 경우)
    .replace(/([다요까죠야네며]\s)(?=[가-힣\*"'])/g, (m, p1) => p1.trimEnd() + '\n');
}

/**
 * 카드의 모든 step content에 줄바꿈 정규화를 적용하고 경고를 반환합니다.
 */
function normalizeCardLineBreaks(card) {
  const warnings = [];
  for (const step of card.steps) {
    const before = step.content;
    step.content = normalizeLineBreaks(step.content);
    // 정규화 후에도 100자 초과 단일행이 남으면 경고
    if (!step.content.includes('\n') && step.content.length > 100) {
      warnings.push(`[${step.type}] 줄바꿈 없는 긴 텍스트 (${step.content.length}자)`);
    } else if (step.content !== before) {
      // 정규화가 적용된 경우 로그
      const lineCount = step.content.split('\n').length;
      warnings.push(`[${step.type}] 줄바꿈 자동 삽입 → ${lineCount}줄`);
    }
  }
  return warnings;
}

// ─── Claude API 호출 ──────────────────────────────────────────────────────────

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API 오류 ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function buildSystemPrompt() {
  return `당신은 SnapWise 카드 콘텐츠 작가입니다.
SnapWise는 복잡한 지식을 10~14개의 시네마틱 스텝으로 전달하는 숏폼 앱입니다.

## 카드 작성 규칙

### 필수 구조
- 첫 스텝: 반드시 cinematic-hook
- 마지막 스텝: 반드시 outro
- 끝에서 두 번째 스텝: 반드시 reveal-title
- 총 스텝 수: 10~14개

### 유효한 step 타입
- cinematic-hook: 강렬한 오프닝, 호기심 유발
- scene: 🎬 장면 묘사 (시간/장소/상황)
- dialogue: 캐릭터 대사 (characterId 필수)
- narration: 📖 사실/개념 설명
- impact: ⚡ 핵심 강조 (짧고 강하게)
- vs: 비교 대결 (항목|설명\\n항목|설명 형식)
- stat: 통계/수치 (📊 아이콘 포함)
- quote: 명언 인용
- timeline: 시간순 나열
- showcase: 목록 데이터
- panel: 다인 대화 (여러 캐릭터)
- splash: 💥 만화 스플래시 효과
- reveal-title: 제목/개념 공개 (끝에서 두 번째)
- outro: 마무리 메시지

### 스타일 규칙
- 한국어로 작성
- **볼드** 적극 활용 (핵심 단어)
- 한 스텝: 3~8줄 분량
- 첫 스텝(cinematic-hook): 역설적 상황이나 미스터리로 시작
- reveal-title: 핵심 개념 이름 + 간단 설명
- outro: 실생활 적용 또는 인사이트

### 줄바꿈 규칙 (필수)
- content 내 문장은 반드시 \\n(줄바꿈)으로 구분할 것
- 한 content에 여러 문장이 있으면 각 문장마다 새 줄로 시작
- 절대로 여러 문장을 한 줄에 이어 쓰지 말 것
- 나쁜 예: "첫 문장이다. 두 번째 문장이다. 세 번째 문장이다."
- 좋은 예: "첫 문장이다.\\n두 번째 문장이다.\\n세 번째 문장이다."

## 출력 형식 (JSON만 출력, 다른 텍스트 없음)

{
  "slug": "영문-슬러그-하이픈-구분-최대40자",
  "frontmatter": {
    "title": "카드 제목",
    "emoji": "단일 이모지",
    "category": "카테고리명",
    "tags": ["태그1", "태그2", "태그3"],
    "difficulty": 1,
    "storyType": "realStory",
    "characters": [
      {"id": "char_id", "name": "캐릭터 이름 (역할)", "emoji": "🔬"}
    ],
    "glossary": [
      {"term": "핵심 용어", "meaning": "간단한 설명"}
    ],
    "pubDate": "오늘 날짜"
  },
  "steps": [
    {"type": "cinematic-hook", "content": "내용"},
    {"type": "scene", "content": "내용"},
    {"type": "dialogue", "characterId": "char_id", "content": "내용"},
    ...
    {"type": "reveal-title", "content": "내용"},
    {"type": "outro", "content": "내용"}
  ]
}

storyType은 realStory | whatIf | fable | firstPerson | twist 중 하나.
characters와 glossary는 해당 없으면 빈 배열 [].`;
}

async function generateCard(category, topic, existingSlugs, retryCount = 0) {
  const today = getToday();
  const topicInstruction = topic
    ? `주제: "${topic}" (카테고리: ${category})`
    : `카테고리 "${category}"에서 흥미롭고 교육적인 주제를 자유롭게 선택하세요.`;

  const userPrompt = `${topicInstruction}

다음 조건으로 SnapWise 카드를 생성해주세요:
- pubDate: ${today}
- 한국어 독자 대상
- 역설적이거나 반전이 있는 스토리 구조 선호
- 실제 사실 기반 (허구 수치 금지)
- JSON만 출력 (다른 설명 없음)`;

  let rawText = '';
  try {
    rawText = await callClaude(buildSystemPrompt(), userPrompt);
  } catch (err) {
    console.error(`  [오류] Claude API 호출 실패: ${err.message}`);
    return null;
  }

  // JSON 추출
  let parsed;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON 없음');
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error(`  [오류] JSON 파싱 실패: ${err.message}`);
    if (retryCount < 1) {
      console.log('  재시도 중...');
      await sleep(API_DELAY_MS * 3);
      return generateCard(category, topic, existingSlugs, retryCount + 1);
    }
    return null;
  }

  // 슬러그 처리
  let slug = parsed.slug || toSlug(parsed.frontmatter?.title || topic || category);
  // 중복 슬러그 처리
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${today.replace(/-/g, '')}`;
  }
  parsed.slug = slug;

  // 검증
  const { valid, errors } = validateCard(parsed);
  if (!valid) {
    console.error(`  [검증 실패] ${errors.join(', ')}`);
    if (retryCount < 1) {
      console.log('  재시도 중...');
      await sleep(API_DELAY_MS * 3);
      return generateCard(category, topic, existingSlugs, retryCount + 1);
    }
    return null;
  }

  // 줄바꿈 정규화 — 문장 경계에서 \n 자동 삽입
  const lineBreakWarnings = normalizeCardLineBreaks(parsed);
  if (lineBreakWarnings.length > 0) {
    for (const w of lineBreakWarnings) {
      console.log(`  ⚠ 줄바꿈: ${w}`);
    }
  }

  return parsed;
}

// ─── 파일 저장 ────────────────────────────────────────────────────────────────

function saveCard(card) {
  const { slug, frontmatter, steps } = card;
  const category = frontmatter.category;
  const catDir = join(ROOT, 'content', category);

  if (!existsSync(catDir)) {
    mkdirSync(catDir, { recursive: true });
  }

  const filePath = join(catDir, `${slug}.mdx`);
  const mdxContent = buildMdxContent(frontmatter, steps);
  writeFileSync(filePath, mdxContent, 'utf-8');

  return filePath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY 환경변수가 필요합니다.');
    process.exit(1);
  }

  console.log(`\n🚀 SnapWise 자동 카드 생성 시작`);
  console.log(`   모델: ${CLAUDE_MODEL}`);
  console.log(`   카테고리당: ${CARDS_PER_CATEGORY}장`);
  console.log(`   날짜: ${getToday()}\n`);

  // 씨앗 로드
  const seedsPath = join(__dirname, 'card-seeds.json');
  const seeds = existsSync(seedsPath)
    ? JSON.parse(readFileSync(seedsPath, 'utf-8'))
    : {};

  // 기존 슬러그/제목 수집
  const existingSlugs = getExistingSlugs();
  const existingTitles = getExistingTitles();
  console.log(`   기존 카드: ${existingSlugs.size}장\n`);

  // 카테고리별 목록 생성
  const categories = selectCategories();
  const totalCount = categories.length;
  console.log(`   총 목표: ${totalCount}장 (${ALL_CATEGORIES.length}카테고리 × ${CARDS_PER_CATEGORY}장)\n`);

  const usedTopics = new Set(existingTitles);
  const usedSeeds = new Set();  // 이번 실행 내 씨앗 키워드 중복 방지
  const newSlugs = new Set();

  let successCount = 0;
  let failCount = 0;
  const savedPaths = [];

  for (let i = 0; i < totalCount; i++) {
    const category = categories[i];
    const topic = pickTopic(category, seeds, usedSeeds);

    console.log(`[${i + 1}/${totalCount}] ${category} — ${topic || '(자유 주제)'}`);

    // 합산된 기존 슬러그 (새로 생성된 것 포함)
    const allSlugs = new Set([...existingSlugs, ...newSlugs]);

    const card = await generateCard(category, topic, allSlugs);

    if (!card) {
      console.log(`  ❌ 실패\n`);
      failCount++;
    } else {
      // 사용된 슬러그/주제 추적
      newSlugs.add(card.slug);
      usedTopics.add(card.frontmatter.title);

      const filePath = saveCard(card);
      savedPaths.push(filePath);
      successCount++;
      console.log(`  ✅ 저장: content/${category}/${card.slug}.mdx\n`);
    }

    // rate limit 대비 딜레이
    if (i < totalCount - 1) {
      await sleep(API_DELAY_MS);
    }
  }

  // 결과 요약
  console.log('─'.repeat(50));
  console.log(`\n📊 생성 완료:`);
  console.log(`   성공: ${successCount}장`);
  console.log(`   실패: ${failCount}장`);
  console.log(`   총 카드: ${existingSlugs.size + successCount}장\n`);

  // GitHub Actions에서 커밋 메시지용 환경변수 설정
  if (process.env.GITHUB_ENV) {
    appendFileSync(process.env.GITHUB_ENV, `CARD_COUNT=${successCount}\n`);
  }

  // 실패가 있어도 성공한 것만 커밋
  if (successCount === 0) {
    console.log('⚠️  생성된 카드가 없습니다.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
