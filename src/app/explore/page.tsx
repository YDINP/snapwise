import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCards } from '@/lib/content';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import CardIndexList from '@/components/navigation/CardIndexList';

const PAGE_URL = `${SITE_URL}/explore`;

export const metadata: Metadata = {
  title: `전체 카드 | ${SITE_NAME}`,
  description: `${SITE_DESCRIPTION} — 과학, 심리, 역사, 비즈니스, 문화 등 전체 지식 카드를 한눈에 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `전체 카드 | ${SITE_NAME}`,
    description: `${SITE_DESCRIPTION} — 과학, 심리, 역사, 비즈니스, 문화 등 전체 지식 카드를 한눈에 확인하세요.`,
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function ExplorePage() {
  const allCards = getAllCards();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '전체 카드', item: PAGE_URL },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main
        style={{
          minHeight: '100dvh',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: '2rem 1.25rem 0',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-sub)',
              textDecoration: 'none',
              marginBottom: '1.25rem',
            }}
          >
            ← 홈
          </Link>

          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
            }}
          >
            전체 카드
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-sub)',
              marginBottom: '0',
              wordBreak: 'keep-all',
            }}
          >
            총 {allCards.length}개의 지식 카드를 만나보세요.
          </p>
        </div>

        {/* 카드 인덱스 */}
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <CardIndexList cards={allCards} />
        </div>
      </main>
    </>
  );
}
