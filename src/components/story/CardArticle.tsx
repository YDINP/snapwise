// 서버 컴포넌트 — 'use client' 절대 금지 (정적 HTML에 포함되어야 SEO에 유효)
import type { CardMeta, CardStep } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';

interface CardArticleProps {
  card: CardMeta;
}

// **bold** 마크다운을 <strong>으로 변환하는 간단한 인라인 파서
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

// 단락 분리: \n 기준으로 나눠 빈 줄 제거 후 각 줄을 <p>로
function renderParagraphs(content: string): React.ReactNode {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className="mb-3 leading-relaxed">
          {renderInline(line)}
        </p>
      ))}
    </>
  );
}

// 스텝별 렌더링 헬퍼
function renderStepContent(step: CardStep, card: CardMeta): React.ReactNode {
  const { type, content, characterId } = step;

  // vs 타입: 각 줄이 "왼쪽|오른쪽" 형식
  if (type === 'vs') {
    const lines = content.split('\n').filter((l) => l.trim() !== '');
    return (
      <>
        {lines.map((line, i) => {
          if (line.includes('|')) {
            const [left, right] = line.split('|');
            return (
              <p key={i} className="mb-2 leading-relaxed">
                {renderInline(left.trim())}
                <span className="mx-2 text-[var(--color-muted)]">—</span>
                {renderInline(right.trim())}
              </p>
            );
          }
          return (
            <p key={i} className="mb-2 leading-relaxed">
              {renderInline(line)}
            </p>
          );
        })}
      </>
    );
  }

  // steps 타입: "1. 제목 | 설명" 형식 → <ol>
  if (type === 'steps') {
    const lines = content.split('\n').filter((l) => l.trim() !== '');
    const items = lines.map((line) => {
      // "1. 제목 | 설명" 또는 "1. 내용" 형태
      const withoutNum = line.replace(/^\d+\.\s*/, '');
      if (withoutNum.includes('|')) {
        const [title, desc] = withoutNum.split('|');
        return { title: title.trim(), desc: desc?.trim() ?? '' };
      }
      return { title: withoutNum.trim(), desc: '' };
    });
    return (
      <ol className="list-decimal list-inside space-y-2 mb-3">
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            <strong>{renderInline(item.title)}</strong>
            {item.desc && (
              <>
                <span className="mx-1 text-[var(--color-muted)]">—</span>
                <span>{renderInline(item.desc)}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    );
  }

  // reveal-title 타입: h1에 이미 제목 있으므로 부제/내용만 <p>
  if (type === 'reveal-title') {
    return (
      <p className="text-center font-semibold leading-relaxed">
        {renderInline(content)}
      </p>
    );
  }

  // dialogue 타입: 화자 이름 표시
  if (type === 'dialogue') {
    const character = card.characters?.find((c) => c.id === characterId);
    if (character) {
      return (
        <blockquote className="border-l-2 border-[var(--color-accent)] pl-4 mb-3 italic">
          <p className="mb-1">
            <strong>{character.emoji} {character.name}:</strong>
          </p>
          {renderParagraphs(content)}
        </blockquote>
      );
    }
    return (
      <blockquote className="border-l-2 border-[var(--color-border)] pl-4 mb-3 italic">
        {renderParagraphs(content)}
      </blockquote>
    );
  }

  // 그 외 모든 타입: 줄 단위 <p>
  return renderParagraphs(content);
}

// 스텝 타입별 레이블 (접근성 & 가독성용)
function getStepLabel(type: string): string {
  const labels: Record<string, string> = {
    'cinematic-hook': '오프닝',
    'scene': '장면',
    'dialogue': '대화',
    'narration': '내레이션',
    'impact': '핵심',
    'reveal-title': '결론',
    'outro': '마무리',
    'vs': '비교',
    'stat': '통계',
    'steps': '단계',
    'fact': '사실',
    'quote': '인용',
    'timeline': '타임라인',
    'panel': '패널',
    'cliffhanger': '반전',
    'data-viz': '데이터',
    'splash': '인트로',
    'manga-scene': '장면',
    'showcase': '하이라이트',
  };
  return labels[type] ?? type;
}

export default function CardArticle({ card }: CardArticleProps) {
  const categoryInfo = getCategoryInfo(card.category);

  return (
    <article className="max-w-2xl mx-auto px-5 py-12">
      {/* 읽기영역 구분 헤더 */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-border)]">
        <span className="text-[var(--color-muted)] text-sm">📖 전체 내용</span>
        <span className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <header className="mb-10">
        {/* 카테고리 라벨 */}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider mb-4">
          {categoryInfo.emoji} {categoryInfo.label}
        </span>

        {/* 제목 */}
        <h1 className="text-2xl font-bold leading-tight mb-3 text-[var(--color-text)]">
          {card.emoji} {card.title}
        </h1>

        {/* 날짜 */}
        <time
          dateTime={String(card.pubDate)}
          className="text-sm text-[var(--color-muted)]"
        >
          {String(card.pubDate).slice(0, 10)}
        </time>

        {/* 태그 목록 */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-sub)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 스텝 본문 */}
      {card.steps.map((step, index) => (
        <section
          key={index}
          className="mb-8 text-[var(--color-text)] text-base"
          aria-label={getStepLabel(step.type)}
        >
          {/* 스텝 타입 레이블 (작게) */}
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-2">
            {getStepLabel(step.type)}
          </span>
          {renderStepContent(step, card)}
        </section>
      ))}
    </article>
  );
}
