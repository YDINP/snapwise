import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 px-6">
        <div className="text-8xl">🔍</div>
        <h1 className="text-4xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="text-lg opacity-70">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
