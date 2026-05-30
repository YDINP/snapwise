import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `개인정보처리방침 | ${SITE_NAME}`,
  description:
    'SnapWise의 개인정보 수집·이용·제공 및 Google AdSense 등 제3자 광고 서비스에 관한 방침을 안내합니다.',
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-12" style={{ color: 'var(--color-text)', background: 'var(--color-bg)' }}>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm mb-8 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--color-text-sub)' }}
      >
        ← 홈
      </Link>

      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        개인정보처리방침
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
        시행일자: 2025년 6월 1일
      </p>

      <div className="space-y-8 leading-relaxed" style={{ color: 'var(--color-text)' }}>
        <section>
          <h2 className="text-lg font-semibold mb-3">1. 총칙</h2>
          <p>
            SnapWise(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 다루며,
            「개인정보 보호법」 및 관련 법령에 따라 이용자의 개인정보를 보호합니다.
            본 방침은 서비스가 어떤 정보를 수집하고, 어떻게 이용하며, 어떻게 보호하는지를 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. 수집하는 정보</h2>
          <p>서비스는 다음 정보를 수집할 수 있습니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm" style={{ color: 'var(--color-text-sub)' }}>
            <li>접속 로그 (IP 주소, 브라우저 종류, 운영체제, 방문 시각, 참조 URL 등)</li>
            <li>쿠키 및 유사 기술을 통해 수집되는 익명 식별자</li>
            <li>페이지 조회수, 체류 시간 등 익명 사용 통계 데이터</li>
          </ul>
          <p className="mt-3">
            서비스는 이름, 이메일 주소, 전화번호 등 직접 식별 가능한 개인정보를 별도로 수집하지 않습니다.
            단, 이용자가 이메일로 문의를 보낸 경우 해당 이메일 주소와 내용이 보관됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Google AdSense 및 제3자 광고</h2>
          <p>
            서비스는 Google AdSense를 포함한 제3자 광고 네트워크를 통해 광고를 게재할 수 있습니다.
            Google을 포함한 제3자 공급업체는 쿠키(DoubleClick 쿠키 포함)를 사용하여
            이용자의 관심사에 기반한 맞춤형 광고를 제공합니다.
          </p>
          <p className="mt-3">
            이용자는 다음 방법으로 맞춤 광고를 비활성화할 수 있습니다.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm" style={{ color: 'var(--color-text-sub)' }}>
            <li>
              Google 광고 설정 페이지(
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70"
                style={{ color: 'var(--color-accent)' }}
              >
                https://www.google.com/settings/ads
              </a>
              )에서 개인 맞춤 광고 비활성화
            </li>
            <li>
              NAI(Network Advertising Initiative) 옵트아웃 페이지(
              <a
                href="https://optout.networkadvertising.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70"
                style={{ color: 'var(--color-accent)' }}
              >
                https://optout.networkadvertising.org
              </a>
              ) 이용
            </li>
          </ul>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-sub)' }}>
            Google의 광고 정책 및 개인정보 처리 방식에 대한 자세한 내용은{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70"
              style={{ color: 'var(--color-accent)' }}
            >
              Google 광고 정책 페이지
            </a>
            에서 확인하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. 쿠키 사용 및 거부 방법</h2>
          <p>
            서비스는 사용자 경험 개선과 광고 제공 목적으로 쿠키를 사용합니다.
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.
            단, 쿠키를 거부할 경우 일부 서비스 기능이 제한될 수 있습니다.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm" style={{ color: 'var(--color-text-sub)' }}>
            <li>Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
            <li>Firefox: 설정 → 개인 정보 및 보안 → 쿠키 및 사이트 데이터</li>
            <li>Safari: 환경설정 → 개인 정보 보호 → 쿠키 차단</li>
            <li>Edge: 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. 분석 도구 사용</h2>
          <p>
            서비스는 페이지 조회수, 인기 콘텐츠 등을 파악하기 위해 익명 집계 방식의 분석 도구를 사용합니다.
            수집되는 데이터는 특정 개인을 식별할 수 없는 통계 형태로만 처리됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. 개인정보의 보관 및 파기</h2>
          <p>
            서비스는 수집한 정보를 목적이 달성된 후 지체 없이 파기합니다.
            단, 관련 법령에 의해 보존 의무가 있는 경우 해당 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. 개인정보 보호책임자 및 문의</h2>
          <p>
            개인정보 처리 관련 문의, 열람 요청, 삭제 요청은 아래 연락처로 보내주세요.
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
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-sub)' }}>
            문의를 받은 날로부터 영업일 기준 7일 이내에 답변을 드리겠습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. 방침의 변경</h2>
          <p>
            본 방침은 법령 개정 또는 서비스 변경에 따라 업데이트될 수 있습니다.
            변경 시 서비스 내 공지를 통해 안내합니다.
          </p>
        </section>
      </div>
    </main>
  );
}
