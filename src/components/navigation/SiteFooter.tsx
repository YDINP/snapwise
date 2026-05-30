import Link from 'next/link';
import { CATEGORIES, ALL_CATEGORY_KEYS } from '@/lib/categories';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text)',
        padding: '2.5rem 1.25rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        {/* 소개 */}
        <div>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: 'var(--color-text)',
            }}
          >
            {SITE_NAME}
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-sub)',
              lineHeight: 1.6,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {SITE_DESCRIPTION}
          </p>
        </div>

        {/* 둘러보기 */}
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '0.75rem',
            }}
          >
            둘러보기
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <Link href="/explore" className="footer-nav-link">
                전체 카드
              </Link>
            </li>
            {ALL_CATEGORY_KEYS.map((key) => {
              const cat = CATEGORIES[key];
              return (
                <li key={key} style={{ marginBottom: '0.4rem' }}>
                  <Link href={`/category/${key}`} className="footer-nav-link">
                    {cat.emoji} {cat.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 정보 */}
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '0.75rem',
            }}
          >
            정보
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { href: '/about', label: '소개' },
              { href: '/privacy', label: '개인정보처리방침' },
              { href: '/contact', label: '문의' },
            ].map(({ href, label }) => (
              <li key={href} style={{ marginBottom: '0.4rem' }}>
                <Link href={href} className="footer-nav-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 카피라이트 */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-sub)',
          fontSize: '0.75rem',
          color: 'var(--color-muted)',
          textAlign: 'center',
        }}
      >
        © {currentYear} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
