import { ImageResponse } from 'next/og';
import { ALL_CATEGORY_KEYS, getCategoryInfo } from '@/lib/categories';
import type { CategoryKey } from '@/types/content';

export const alt = 'SnapWise 카테고리';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return ALL_CATEGORY_KEYS.map((key) => ({ category: key }));
}

interface Props {
  params: Promise<{ category: string }>;
}

export default async function Image({ params }: Props) {
  const { category } = await params;

  const info = ALL_CATEGORY_KEYS.includes(category as CategoryKey)
    ? getCategoryInfo(category as CategoryKey)
    : { emoji: '📚', label: category, accent: '#6366F1' };

  let fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts'] = [];
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf'
    );
    if (res.ok) {
      const fontData = await res.arrayBuffer();
      fonts = [{ name: 'Pretendard', data: fontData, style: 'normal', weight: 700 }];
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 60%, ${info.accent}33 100%)`,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Pretendard',
        }}
      >
        <div
          style={{
            width: 100,
            height: 4,
            background: info.accent,
            borderRadius: 2,
            marginBottom: 32,
          }}
        />
        <div style={{ fontSize: 80, marginBottom: 24 }}>{info.emoji}</div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 16,
          }}
        >
          {info.label}
        </div>
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 40,
          }}
        >
          짧고 유용한 지식 카드
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 22,
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 700,
          }}
        >
          SnapWise
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
