import Link from 'next/link';
import { getCategoryInfo } from '@/lib/categories';
import type { CardMeta } from '@/types/content';

interface Props {
  cards: CardMeta[];
  heading?: string;
}

function cleanDescription(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 110);
}

export default function CardIndexList({ cards, heading }: Props) {
  // 카테고리별로 그룹핑
  const grouped = cards.reduce<Record<string, CardMeta[]>>((acc, card) => {
    const key = card.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
    return acc;
  }, {});

  const categoryKeys = Object.keys(grouped);

  return (
    <section
      aria-label={heading ?? '카드 목록'}
      style={{
        padding: '3rem 1.25rem 2rem',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {heading && (
        <h2
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            marginBottom: '2rem',
            color: 'var(--color-text)',
          }}
        >
          {heading}
        </h2>
      )}

      {categoryKeys.map((catKey) => {
        const info = getCategoryInfo(catKey as Parameters<typeof getCategoryInfo>[0]);
        const catCards = grouped[catKey];
        return (
          <div key={catKey} style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontSize: '1.0625rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.5rem',
              }}
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-muted)',
                  marginLeft: '0.25rem',
                }}
              >
                {catCards.length}개
              </span>
            </h2>

            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.875rem',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {catCards.map((card) => {
                const summary = cleanDescription(card.content);
                return (
                  <li key={card.slug}>
                    <Link
                      href={`/card/${card.slug}`}
                      className="card-index-link"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.625rem',
                          marginBottom: '0.375rem',
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>
                          {card.emoji}
                        </span>
                        <h3
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            color: 'var(--color-text)',
                            margin: 0,
                            wordBreak: 'keep-all',
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      {summary && (
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--color-text-sub)',
                            lineHeight: 1.6,
                            margin: 0,
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {summary}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
