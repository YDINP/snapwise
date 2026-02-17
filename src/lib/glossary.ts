/**
 * Central glossary database.
 * Terms are auto-matched against step content.
 * Card-topic terms are filtered out at render time.
 */

export interface GlossaryEntry {
  term: string;
  meaning: string;
  /** Related keywords — if the card title/tags contain these, this term is "on-topic" and should be hidden */
  relatedTopics?: string[];
}

/** Master glossary — add terms as needed */
export const GLOSSARY_DB: GlossaryEntry[] = [
  // ─── 물리학 / 우주 ───
  { term: '양자역학', meaning: '원자 이하 세계를 설명하는 물리학 이론', relatedTopics: ['양자', 'quantum'] },
  { term: '상대성이론', meaning: '아인슈타인이 제안한 시공간과 중력 이론', relatedTopics: ['상대성', '아인슈타인', 'relativity'] },
  { term: '엔트로피', meaning: '무질서도. 에너지가 퍼져나가는 방향의 척도', relatedTopics: ['entropy', '엔트로피'] },
  { term: '블랙홀', meaning: '빛조차 탈출할 수 없는 극도로 강한 중력 영역', relatedTopics: ['black hole', '블랙홀'] },
  { term: '반물질', meaning: '보통 물질과 만나면 소멸하며 에너지를 방출하는 물질', relatedTopics: ['antimatter', '반물질'] },
  { term: '핵융합', meaning: '가벼운 원자핵이 합쳐져 무거운 핵이 되며 에너지를 방출하는 반응', relatedTopics: ['fusion', '핵융합'] },
  { term: '중성미자', meaning: '거의 모든 물질을 통과하는 극소 입자', relatedTopics: ['neutrino', '중성미자'] },
  { term: '큐비트', meaning: '양자 컴퓨터의 정보 단위. 0과 1을 동시에 가질 수 있음', relatedTopics: ['qubit', '큐비트', '양자 컴퓨터'] },
  { term: '쌍소멸', meaning: '물질과 반물질이 만나 순수 에너지로 변환되는 현상', relatedTopics: ['반물질', 'antimatter'] },
  { term: '사건의 지평선', meaning: '블랙홀에서 빛이 탈출할 수 없는 경계선', relatedTopics: ['블랙홀', 'black hole'] },
  { term: '특이점', meaning: '물리 법칙이 무한대로 발산하는 지점 (블랙홀 중심 등)', relatedTopics: ['블랙홀', 'singularity'] },
  { term: '열수구', meaning: '심해 바닥에서 뜨거운 물이 뿜어나오는 구멍', relatedTopics: ['심해', 'ocean'] },

  // ─── 뇌과학 / 심리학 ───
  { term: '도파민', meaning: '기대와 동기부여에 관여하는 신경전달물질', relatedTopics: ['dopamine', '도파민'] },
  { term: '세로토닌', meaning: '기분 안정과 수면에 관여하는 신경전달물질', relatedTopics: ['serotonin', '세로토닌'] },
  { term: '코르티솔', meaning: '스트레스 반응 시 분비되는 호르몬', relatedTopics: ['cortisol', '코르티솔'] },
  { term: '해마', meaning: '기억 형성과 공간 인지를 담당하는 뇌 부위', relatedTopics: ['hippocampus', '해마'] },
  { term: '편도체', meaning: '공포·감정 처리를 담당하는 뇌의 아몬드 모양 구조', relatedTopics: ['amygdala'] },
  { term: '뇌가소성', meaning: '경험에 따라 뇌 구조가 변화하는 능력', relatedTopics: ['brain plasticity', '뇌가소성'] },
  { term: '인지부조화', meaning: '자신의 믿음과 행동이 모순될 때 느끼는 심리적 불편', relatedTopics: ['cognitive dissonance', '인지부조화'] },
  { term: '프레이밍 효과', meaning: '같은 정보도 표현 방식에 따라 다른 판단을 하게 되는 현상', relatedTopics: ['framing', '프레이밍'] },
  { term: '확증편향', meaning: '자신의 기존 믿음을 확인하는 정보만 선택적으로 받아들이는 경향', relatedTopics: ['confirmation bias', '확증편향'] },
  { term: '가용성 휴리스틱', meaning: '쉽게 떠오르는 사례로 확률을 판단하는 사고 편향', relatedTopics: ['availability heuristic', '가용성'] },
  { term: '앵커링 효과', meaning: '처음 접한 숫자에 이후 판단이 끌리는 현상', relatedTopics: ['anchoring', '앵커링'] },
  { term: '플라시보', meaning: '가짜 약이 실제 효과를 내는 심리적 현상', relatedTopics: ['placebo', '플라시보'] },

  // ─── 생물학 / 의학 ───
  { term: 'CRISPR', meaning: '유전자를 정밀하게 잘라 편집하는 기술', relatedTopics: ['crispr', '유전자 편집'] },
  { term: 'DNA', meaning: '생명체의 유전 정보를 담은 이중나선 분자', relatedTopics: ['dna', '유전자'] },
  { term: '텔로미어', meaning: '염색체 끝의 보호 구조. 세포 노화와 관련', relatedTopics: ['telomere', '텔로미어'] },
  { term: '장내미생물', meaning: '장 속에 사는 수조 개의 미생물 생태계', relatedTopics: ['gut', '장내'] },
  { term: '오토파지', meaning: '세포가 스스로 노폐물을 분해·재활용하는 과정', relatedTopics: ['autophagy', '오토파지', '단식'] },

  // ─── 역사 / 문명 ───
  { term: '룬 문자', meaning: '고대 게르만·바이킹이 사용한 문자 체계', relatedTopics: ['rune', '룬'] },
  { term: '스칸디나비아', meaning: '북유럽 지역 (덴마크·스웨덴·노르웨이)', relatedTopics: ['scandinavia'] },
  { term: '실크로드', meaning: '고대 동서양을 잇던 교역로 네트워크', relatedTopics: ['silk road', '실크로드'] },
  { term: '판구조론', meaning: '지구 표면이 여러 판으로 나뉘어 움직인다는 이론', relatedTopics: ['plate tectonics', '판구조'] },
  { term: '코펜하겐 해석', meaning: '관측 전까지 양자 상태는 결정되지 않는다는 해석', relatedTopics: ['코펜하겐', '양자역학'] },
  { term: '흑사병', meaning: '14세기 유럽 인구의 1/3을 죽인 전염병', relatedTopics: ['black death', '흑사병', '페스트'] },

  // ─── 기술 / IT ───
  { term: '블록체인', meaning: '중앙 서버 없이 거래를 기록하는 분산 장부 기술', relatedTopics: ['blockchain', '블록체인'] },
  { term: '알고리즘', meaning: '문제를 해결하기 위한 단계적 절차', relatedTopics: ['algorithm', '알고리즘'] },
  { term: 'P2P', meaning: '중앙 서버 없이 개인 간 직접 연결되는 네트워크 방식', relatedTopics: ['p2p', 'peer'] },
  { term: 'LTV', meaning: '고객 생애 가치. 한 고객이 평생 가져다주는 수익', relatedTopics: ['ltv', '생애 가치'] },
  { term: 'CAC', meaning: '고객 획득 비용. 한 명의 고객을 얻는 데 드는 비용', relatedTopics: ['cac', '획득 비용'] },
  { term: 'OKR', meaning: '목표와 핵심 결과. 구글이 사용하는 목표 관리 프레임워크', relatedTopics: ['okr'] },
  { term: 'KPI', meaning: '핵심 성과 지표. 성과를 측정하는 정량적 기준', relatedTopics: ['kpi'] },

  // ─── 경제 / 비즈니스 ───
  { term: '구독 경제', meaning: '소유 대신 정기 구독으로 상품·서비스를 이용하는 모델', relatedTopics: ['subscription', '구독'] },
  { term: '유닛 이코노믹스', meaning: '고객 한 명 단위로 수익성을 분석하는 방법', relatedTopics: ['unit economics', '유닛'] },
  { term: '성장 해킹', meaning: '빠른 성장을 위해 제품·마케팅을 실험적으로 최적화하는 전략', relatedTopics: ['growth hacking', '성장 해킹'] },
  { term: '피보나치 수열', meaning: '앞의 두 수를 더한 수열 (1,1,2,3,5,8...). 자연계에서 반복 발견됨', relatedTopics: ['fibonacci', '피보나치'] },
  { term: '파레토 법칙', meaning: '결과의 80%가 원인의 20%에서 나온다는 경험적 법칙', relatedTopics: ['pareto', '파레토', '80/20'] },

  // ─── 문화 / 철학 ───
  { term: '오컴의 면도날', meaning: '불필요한 가정을 제거하고 가장 단순한 설명을 택하라는 원칙', relatedTopics: ['occam', '오컴'] },
  { term: '피터 원칙', meaning: '사람은 무능해지는 직급까지 승진한다는 법칙', relatedTopics: ['peter principle', '피터'] },
  { term: '파킨슨 법칙', meaning: '일은 주어진 시간을 모두 채울 때까지 늘어난다는 법칙', relatedTopics: ['parkinson', '파킨슨'] },
  { term: '던바의 수', meaning: '인간이 안정적으로 유지할 수 있는 사회적 관계의 한계(약 150명)', relatedTopics: ['dunbar', '던바'] },
  { term: '가스라이팅', meaning: '상대의 현실 인식을 조작해 자기 의심을 하게 만드는 심리적 학대', relatedTopics: ['gaslighting', '가스라이팅'] },
  { term: '임포스터 증후군', meaning: '성공을 거뒀어도 자신이 사기꾼이라 느끼는 심리', relatedTopics: ['impostor', '임포스터'] },
];

/**
 * Find glossary entries that match the given text content,
 * excluding terms that are directly about the card's own topic.
 */
export function findGlossaryTerms(
  stepContent: string,
  cardTitle: string,
  cardTags: string[],
): GlossaryEntry[] {
  const titleLower = cardTitle.toLowerCase();
  const tagsLower = cardTags.map(t => t.toLowerCase());

  return GLOSSARY_DB.filter(entry => {
    // 1. Term must appear in this step's content
    if (!stepContent.includes(entry.term)) return false;

    // 2. Exclude if term IS the card's own topic
    // Check if term matches card title
    if (titleLower.includes(entry.term.toLowerCase())) return false;
    if (entry.term.toLowerCase().includes(titleLower)) return false;

    // Check if term's related topics overlap with card tags/title
    if (entry.relatedTopics) {
      for (const topic of entry.relatedTopics) {
        const topicLower = topic.toLowerCase();
        if (titleLower.includes(topicLower)) return false;
        if (tagsLower.some(tag => tag.includes(topicLower) || topicLower.includes(tag))) return false;
      }
    }

    return true;
  });
}
