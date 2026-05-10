/**
 * SnapWise 카드 비주얼 자동 생성기
 * 사용법:
 *   npm run visuals:generate                  # 모든 카드
 *   npm run visuals:generate -- --slug=xxx    # 특정 카드만
 *   npm run visuals:generate -- --category=psychology
 *   npm run visuals:generate -- --dry-run     # 프롬프트만 출력
 *   npm run visuals:generate -- --force       # 기존 이미지 덮어쓰기
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { generateImage } from './lib/pollinations-client';
import { convertToWebp } from './lib/image-optimizer';
import {
  buildHookPrompt,
  buildThumbnailPrompt,
  buildScenePrompt,
  buildImpactPrompt,
  buildRevealTitlePrompt,
  buildDialoguePrompt,
  buildShowcasePrompt,
  type PromptResult,
} from './prompts/index';
import type { CardMeta, CardStep } from '../src/types/content';

// tsx는 __dirname을 주입하지만 ESM 환경 대비 안전하게 처리
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const VISUALS_DIR = path.join(ROOT, 'public', 'visuals');

/**
 * MDX 본문에서 <!-- step:타입 --> 구분자를 파싱해 CardStep[] 반환
 * frontmatter에 steps 배열이 없는 구조 대응
 */
function parseStepsFromContent(content: string): CardStep[] {
  const steps: CardStep[] = [];
  // <!-- step:타입 --> 또는 <!-- step:타입:캐릭터id --> 형식
  const stepRegex = /<!--\s*step:([^\s>:]+)(?::([^\s>]+))?\s*-->([\s\S]*?)(?=<!--\s*step:|$)/g;
  let match: RegExpExecArray | null;
  while ((match = stepRegex.exec(content)) !== null) {
    const type = match[1].trim() as CardStep['type'];
    const characterId = match[2]?.trim();
    const rawContent = match[3].trim();
    steps.push({
      type,
      content: rawContent,
      ...(characterId ? { characterId } : {}),
    });
  }
  return steps;
}

interface CliArgs {
  slug?: string;
  category?: string;
  dryRun: boolean;
  force: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const found = args.find(a => a.startsWith(`${flag}=`));
    return found ? found.split('=')[1] : undefined;
  };
  return {
    slug: get('--slug'),
    category: get('--category'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
  };
}

interface CardData {
  filePath: string;
  meta: CardMeta;
  steps: CardStep[];
}

async function listCards(args: CliArgs): Promise<CardData[]> {
  const categories = await fs.readdir(CONTENT_DIR);
  const cards: CardData[] = [];

  for (const cat of categories) {
    if (args.category && cat !== args.category) continue;
    const catDir = path.join(CONTENT_DIR, cat);
    const stat = await fs.stat(catDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(catDir);
    for (const file of files) {
      if (!file.endsWith('.mdx')) continue;
      const filePath = path.join(catDir, file);
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(raw);
      const meta = parsed.data as CardMeta;
      if (meta.draft) continue;

      // slug가 frontmatter에 없으면 파일명에서 추론
      if (!meta.slug) {
        meta.slug = path.basename(file, '.mdx');
      }

      if (args.slug && meta.slug !== args.slug) continue;

      // frontmatter steps 없으면 본문 구분자 파싱으로 fallback
      const steps: CardStep[] =
        Array.isArray(meta.steps) && meta.steps.length > 0
          ? (meta.steps as CardStep[])
          : parseStepsFromContent(parsed.content);

      cards.push({
        filePath,
        meta: { ...meta, content: parsed.content },
        steps,
      });
    }
  }
  return cards;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function processCard(
  card: CardData,
  args: CliArgs,
): Promise<void> {
  const { meta, steps } = card;
  const slugDir = path.join(VISUALS_DIR, meta.slug);

  // 프롬프트 빌드
  const prompts: PromptResult[] = [];

  // 1. hook (cinematic-hook 스텝의 첫 번째)
  const hookStep = steps.find(s => s.type === 'cinematic-hook');
  if (hookStep) {
    prompts.push(buildHookPrompt(meta, hookStep.content));
  }

  // 2. thumbnail (항상 생성)
  prompts.push(buildThumbnailPrompt(meta));

  // 3. scene 스텝들
  steps.forEach((step, idx) => {
    if (step.type === 'scene') {
      prompts.push(buildScenePrompt(meta, step, idx));
    }
  });

  // 4. impact 스텝들
  steps.forEach((step, idx) => {
    if (step.type === 'impact') {
      prompts.push(buildImpactPrompt(meta, step, idx));
    }
  });

  // 5. dialogue 스텝들 — 만화 캐릭터 + 말풍선
  steps.forEach((step, idx) => {
    if (step.type === 'dialogue') {
      prompts.push(buildDialoguePrompt(meta, step, idx));
    }
  });

  // 6. showcase 스텝들 — 정보 포스터
  steps.forEach((step, idx) => {
    if (step.type === 'showcase') {
      prompts.push(buildShowcasePrompt(meta, step, idx));
    }
  });

  // 7. reveal-title
  const revealStep = steps.find(s => s.type === 'reveal-title');
  if (revealStep) {
    prompts.push(buildRevealTitlePrompt(meta, revealStep.content));
  }

  console.log(`\n[${meta.slug}] ${prompts.length}개 이미지 예정`);

  if (args.dryRun) {
    prompts.forEach(p => {
      console.log(`  [dry] ${p.key} (${p.width}x${p.height}, seed:${p.seed})`);
      console.log(`    ${p.prompt.slice(0, 120)}...`);
    });
    return;
  }

  // 생성 + WebP 변환
  for (const p of prompts) {
    const tempPath = path.join(slugDir, `${p.key}.png`);
    const finalPath = path.join(slugDir, `${p.key}.webp`);

    if (!args.force && await exists(finalPath)) {
      console.log(`  [skip] ${p.key}.webp 이미 존재`);
      continue;
    }

    try {
      await generateImage({
        prompt: p.prompt,
        width: p.width,
        height: p.height,
        seed: p.seed,
        outputPath: tempPath,
      });
      await convertToWebp(tempPath, { quality: 82, maxWidth: p.width });
      console.log(`  [ok] ${p.key}.webp`);
    } catch (err) {
      console.error(`  [fail] ${p.key}:`, (err as Error).message);
    }
  }
}

async function main(): Promise<void> {
  const args = parseArgs();
  console.log('SnapWise Visual Generator');
  console.log(`  mode: ${args.dryRun ? 'dry-run' : 'generate'}`);
  console.log(`  filter: slug=${args.slug ?? '*'}, category=${args.category ?? '*'}`);

  const cards = await listCards(args);
  console.log(`  cards: ${cards.length}개\n`);

  for (const card of cards) {
    await processCard(card, args);
  }

  console.log('\n완료');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
