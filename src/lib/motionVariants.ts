import { type Variants } from 'motion/react';

/** 아래에서 위로 fade-in. 카드/컴포넌트 첫 진입용 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/** 단순 opacity fade. 빠른 등장/퇴장 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

/** scale 0.8→1 + opacity. 강조 요소 등장 (팝업, 뱃지) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
};

/** stagger 컨테이너 wrapper. staggerChildren: 0.08 */
export const stagger: Variants = {
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** 왼쪽에서 슬라이드 인. 이전 스텝 방향 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/** 오른쪽에서 슬라이드 인. 다음 스텝 방향 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/** 아래에서 위로 슬라이드 인. 카드 진입 */
export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/**
 * 좌우 흔들기. 경계 피드백 (스텝 0에서 이전 버튼)
 * 사용법: <motion.div animate="shake" variants={shake} />
 */
export const shake: Variants = {
  animate: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
};

/** duration 0. prefers-reduced-motion 대응용 instant */
export const instant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};
