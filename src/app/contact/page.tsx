import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `문의하기 | ${SITE_NAME}`,
  description:
    'SnapWise에 제휴, 광고, 콘텐츠 오류 정정 등 다양한 문의를 보내주세요.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
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
        문의하기
      </h1>

      <div className="space-y-6 leading-relaxed" style={{ color: 'var(--color-text)' }}>
        <p>
          SnapWise에 관심을 가져 주셔서 감사합니다.
          아래 이메일로 언제든지 연락해 주세요. 빠른 시일 내에 답변드리겠습니다.
        </p>

        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>
            이메일
          </p>
          <a
            href="mailto:tinycell001@gmail.com"
            className="text-lg font-semibold underline hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-accent)' }}
          >
            tinycell001@gmail.com
          </a>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            이런 문의를 환영합니다
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-sub)' }}>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--color-accent)' }}>•</span>
              <span><strong style={{ color: 'var(--color-text)' }}>콘텐츠 오류 정정</strong> — 카드 내용에 사실 오류가 있다면 알려주세요. 신속히 검토 후 수정합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--color-accent)' }}>•</span>
              <span><strong style={{ color: 'var(--color-text)' }}>제휴 및 광고</strong> — 서비스와 어울리는 제휴·광고 제안을 환영합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--color-accent)' }}>•</span>
              <span><strong style={{ color: 'var(--color-text)' }}>콘텐츠 제안</strong> — 다뤄줬으면 하는 주제나 카테고리를 제안해 주세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--color-accent)' }}>•</span>
              <span><strong style={{ color: 'var(--color-text)' }}>기타 문의</strong> — 서비스 이용 중 불편한 점이나 개선 아이디어도 언제든지 환영합니다.</span>
            </li>
          </ul>
        </section>

        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          문의를 받은 날로부터 영업일 기준 3~5일 이내에 답변드립니다.
          개인정보 처리 관련 문의는{' '}
          <Link
            href="/privacy"
            className="underline hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-accent)' }}
          >
            개인정보처리방침
          </Link>
          을 참고해 주세요.
        </p>
      </div>
    </main>
  );
}
