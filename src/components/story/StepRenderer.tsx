import type { CardStep, CardMeta } from '@/types/content';
import HookStep from './HookStep';
import StoryStep from './StoryStep';
import RevealStep from './RevealStep';
import ActionStep from './ActionStep';

interface StepRendererProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
}

export default function StepRenderer({ step, card, isActive, nextCard }: StepRendererProps) {
  switch (step.type) {
    case 'hook':
      return <HookStep step={step} card={card} isActive={isActive} />;
    case 'story':
      return <StoryStep step={step} card={card} isActive={isActive} />;
    case 'reveal':
      return <RevealStep step={step} card={card} isActive={isActive} />;
    case 'action':
      return <ActionStep step={step} card={card} isActive={isActive} nextCard={nextCard} />;
    case 'quiz':
      // Fallback to ActionStep for now (Phase 2 will implement QuizStep)
      return <ActionStep step={step} card={card} isActive={isActive} nextCard={nextCard} />;
    default:
      return <StoryStep step={step} card={card} isActive={isActive} />;
  }
}
