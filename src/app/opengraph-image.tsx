import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SnapWise';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Pretendard',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>📚</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 16,
          }}
        >
          SnapWise
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          스와이프로 만나는 짧고 유용한 지식
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
