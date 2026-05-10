import fs from 'node:fs/promises';
import path from 'node:path';

export interface GenerateOptions {
  prompt: string;
  width?: number;       // default 1024
  height?: number;      // default 1536 (9:16 세로)
  seed?: number;        // 재현성
  model?: 'flux' | 'flux-realism' | 'turbo';  // default 'flux'
  outputPath: string;   // 저장 경로 (절대)
}

export async function generateImage(opts: GenerateOptions): Promise<void> {
  const {
    prompt,
    width = 1024,
    height = 1536,
    seed = Math.floor(Math.random() * 100000),
    model = 'flux',
    outputPath,
  } = opts;

  const params = new URLSearchParams({
    model,
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: 'true',
    enhance: 'true',
  });

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;

  console.log(`[pollinations] generating: ${path.basename(outputPath)}`);

  // 재시도 로직 (최대 3회)
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(120_000), // 2분 타임아웃
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      // 디렉토리 생성
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, buffer);
      return;
    } catch (err) {
      lastError = err as Error;
      console.warn(`[pollinations] attempt ${attempt} failed: ${lastError.message}`);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
  }
  throw lastError ?? new Error('Generation failed');
}
