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
    case 'detail':
    case 'example':
      return <StoryStep step={step} card={card} isActive={isActive} />;
    case 'reveal':
    case 'tip':
    case 'compare':
      return <RevealStep step={step} card={card} isActive={isActive} />;
    case 'action':
    case 'quiz':
      return <ActionStep step={step} card={card} isActive={isActive} nextCard={nextCard} />;
    default:
      return <StoryStep step={step} card={card} isActive={isActive} />;
  }
}
