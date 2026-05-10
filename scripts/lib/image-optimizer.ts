import sharp from 'sharp';
import fs from 'node:fs/promises';

/**
 * PNG/JPEG 입력 → WebP 변환 (품질 최적화)
 * 입력 파일을 읽어 같은 경로에 .webp로 저장 후 원본 삭제
 */
export async function convertToWebp(inputPath: string, options?: {
  quality?: number;  // default 82
  maxWidth?: number; // default 1080
}): Promise<string> {
  const { quality = 82, maxWidth = 1080 } = options ?? {};
  const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  await sharp(inputPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outputPath);

  // 원본이 webp가 아니면 삭제
  if (inputPath !== outputPath) {
    await fs.unlink(inputPath).catch(() => {});
  }
  return outputPath;
}
