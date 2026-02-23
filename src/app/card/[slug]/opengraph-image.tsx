import { ImageResponse } from 'next/og';
import { getCardBySlug } from '@/lib/content';

export const dynamic = 'force-static';
export const alt = 'SnapWise 카드';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  let fonts: ConstructorParameters<typeof ImageResponse>[1]['fonts'] = [];
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.woff'
    );
    if (res.ok) {
      const fontData = await res.arrayBuffer();
      fonts = [{ name: 'Pretendard', data: fontData, style: 'normal', weight: 700 }];
    }
  } catch {}

  const emoji = card?.emoji ?? '📝';
  const title = card?.title ?? 'SnapWise';
  const category = card?.category ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'Pretendard',
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 32 }}>{emoji}</div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 24,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        {category && (
          <div
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 20px',
              borderRadius: 20,
              marginBottom: 32,
            }}
          >
            {category}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 22,
            color: 'rgba(255,255,255,0.4)',
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
