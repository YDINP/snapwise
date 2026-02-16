import type { CategoryKey } from '@/types/content';

interface Quote {
  text: string;
  author: string;
}

const CATEGORY_QUOTES: Record<CategoryKey, Quote[]> = {
  science: [
    { text: '상상력은 지식보다 중요하다.', author: '알베르트 아인슈타인' },
    { text: '과학은 사실의 바다에서 진리를 낚는 것이다.', author: '아이작 뉴턴' },
    { text: '모든 위대한 발견은 대담한 추측에서 시작된다.', author: '아이작 아시모프' },
    { text: '자연은 수학의 언어로 쓰여 있다.', author: '갈릴레오 갈릴레이' },
    { text: '호기심은 과학의 어머니다.', author: '토마스 에디슨' },
  ],
  psychology: [
    { text: '인간은 자신이 생각하는 대로 된다.', author: '윌리엄 제임스' },
    { text: '아는 것이 힘이 아니라, 아는 것을 실행하는 것이 힘이다.', author: '알프레드 아들러' },
    { text: '무의식은 정신의 더 큰 원이다.', author: '지그문트 프로이트' },
    { text: '사람은 의미를 찾을 때 어떤 고통도 견딜 수 있다.', author: '빅토르 프랭클' },
    { text: '습관이 바뀌면 인생이 바뀐다.', author: '아리스토텔레스' },
  ],
  people: [
    { text: '세상을 바꾸는 것은 평범한 사람들의 비범한 용기다.', author: '마하트마 간디' },
    { text: '천 리 길도 한 걸음부터.', author: '노자' },
    { text: '실패는 성공의 어머니다.', author: '토마스 에디슨' },
    { text: '위대한 일은 충동이 아니라 작은 일의 연속으로 이루어진다.', author: '빈센트 반 고흐' },
    { text: '나는 실패한 것이 아니라 작동하지 않는 방법을 발견한 것이다.', author: '토마스 에디슨' },
  ],
  history: [
    { text: '역사를 잊은 민족에게 미래는 없다.', author: '윈스턴 처칠' },
    { text: '과거에서 배우지 않는 자는 그것을 반복하게 된다.', author: '조지 산타야나' },
    { text: '역사는 승자의 기록이 아니라 인간의 이야기다.', author: '하워드 진' },
    { text: '오늘의 역사가 내일의 전설이 된다.', author: '맥아더' },
    { text: '우리가 역사에서 배운 것은, 아무것도 배우지 못했다는 것이다.', author: '헤겔' },
  ],
  life: [
    { text: '삶이 있는 한 희망은 있다.', author: '키케로' },
    { text: '인생은 가까이서 보면 비극이지만 멀리서 보면 희극이다.', author: '찰리 채플린' },
    { text: '오늘 할 수 있는 일을 내일로 미루지 마라.', author: '벤자민 프랭클린' },
    { text: '행복은 습관이다. 그것을 몸에 지녀라.', author: '허버트' },
    { text: '지금 이 순간을 살아라.', author: '마르쿠스 아우렐리우스' },
  ],
  business: [
    { text: '혁신은 리더와 추종자를 구분하는 잣대다.', author: '스티브 잡스' },
    { text: '기회는 준비된 자에게 온다.', author: '루이 파스퇴르' },
    { text: '성공은 열정을 잃지 않고 실패에서 실패로 걸어가는 것이다.', author: '윈스턴 처칠' },
    { text: '가장 큰 위험은 아무 위험도 감수하지 않는 것이다.', author: '마크 저커버그' },
    { text: '고객이 원하는 것을 주지 말고, 필요한 것을 만들어라.', author: '스티브 잡스' },
  ],
  culture: [
    { text: '예술은 자연이 만들지 못한 것을 완성한다.', author: '아리스토텔레스' },
    { text: '모든 예술은 무용하다. 그것이 예술의 매력이다.', author: '오스카 와일드' },
    { text: '음악은 말로 표현할 수 없는 것을 전한다.', author: '빅토르 위고' },
    { text: '문화는 인간이 스스로를 표현하는 방식이다.', author: '에드워드 타일러' },
    { text: '창조는 기존의 것을 새롭게 연결하는 것이다.', author: '스티브 잡스' },
  ],
  origins: [
    { text: '언어의 한계가 곧 세계의 한계다.', author: '루트비히 비트겐슈타인' },
    { text: '말은 생각의 옷이다.', author: '사무엘 존슨' },
    { text: '이름을 아는 것과 이해하는 것은 다르다.', author: '리처드 파인만' },
    { text: '한 민족의 언어는 그 민족의 정신이다.', author: '빌헬름 폰 훔볼트' },
    { text: '단어 하나를 바꾸면 세상이 달라진다.', author: '루이스 캐럴' },
  ],
  etc: [
    { text: '배움에는 끝이 없다.', author: '공자' },
    { text: '호기심은 인간의 가장 위대한 미덕이다.', author: '알베르트 아인슈타인' },
    { text: '세상에서 가장 아름다운 것은 보이지 않는 것이다.', author: '생텍쥐페리' },
    { text: '아는 만큼 보인다.', author: '유홍준' },
    { text: '질문하는 자가 5분 바보라면, 질문하지 않는 자는 영원한 바보다.', author: '중국 속담' },
  ],
};

/** Pick a deterministic quote based on slug hash */
export function getQuoteForCard(slug: string, category: CategoryKey): Quote {
  const quotes = CATEGORY_QUOTES[category] || CATEGORY_QUOTES.etc;
  // Simple hash from slug to pick a consistent quote
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
}
