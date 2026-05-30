import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `SnapWise 소개 | ${SITE_NAME}`,
  description:
    'SnapWise는 심리학·과학·역사·비즈니스 등 다양한 분야의 지식을 시네마틱 스토리카드 숏폼으로 전달하는 지식 미디어입니다.',
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-12" style={{ color: 'var(--color-text)', background: 'var(--color-bg)' }}>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm mb-8 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--color-text-sub)' }}
      >
        ← 홈
      </Link>

      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text)' }}>
        SnapWise 소개
      </h1>

      <div className="space-y-6 leading-relaxed" style={{ color: 'var(--color-text)' }}>
        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            무엇을 하는 서비스인가요?
          </h2>
          <p>
            SnapWise는 복잡하고 어렵게 느껴지는 지식을 짧고 강렬한 스토리카드 형식으로 전달하는 지식 미디어입니다.
            심리학, 과학, 역사, 비즈니스, 라이프, 인물, 문화, 어원, 상식 등 9개 카테고리에 걸쳐
            한 편당 8~15개의 시네마틱 장면으로 구성된 카드를 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            어떻게 만들어지나요?
          </h2>
          <p>
            단순한 사실 나열이 아니라 허구의 시나리오, 대화, 내레이션을 활용해 개념을 이야기로 풀어냅니다.
            각 카드는 '궁금증 유발 → 스토리 전개 → 핵심 공개'의 시네마틱 Title-Last 패턴을 따르며,
            에디토리얼 검수를 거쳐 정확성과 가독성을 확보합니다.
          </p>
          <p className="mt-3">
            카드의 내용은 공개된 학술 자료, 단행본, 공신력 있는 미디어 등을 바탕으로 작성되며,
            정보 오류 발견 시 이메일로 정정 요청을 주시면 신속히 검토합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            카테고리
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              { key: 'science', label: '과학' },
              { key: 'psychology', label: '심리' },
              { key: 'people', label: '인물' },
              { key: 'history', label: '역사' },
              { key: 'life', label: '라이프' },
              { key: 'business', label: '비즈니스' },
              { key: 'culture', label: '문화' },
              { key: 'origins', label: '어원' },
              { key: 'etc', label: '상식' },
            ].map(({ key, label }) => (
              <li key={key}>
                <Link
                  href={`/category/${key}`}
                  className="inline-block px-3 py-1.5 rounded-lg text-sm hover:opacity-70 transition-opacity"
                  style={{
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text-sub)',
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            운영 주체 및 연락처
          </h2>
          <p>
            SnapWise는 개인 운영 서비스입니다. 제휴, 광고, 콘텐츠 오류 정정, 기타 문의 사항은
            아래 이메일로 연락해 주세요.
          </p>
          <p className="mt-2">
            <strong>이메일:</strong>{' '}
            <a
              href="mailto:tinycell001@gmail.com"
              className="underline hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-accent)' }}
            >
              tinycell001@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
