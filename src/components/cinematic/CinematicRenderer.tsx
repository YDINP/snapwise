'use client';

import type { CardStep, CardMeta } from '@/types/content';
import CinematicHook from './CinematicHook';
import SceneStep from './SceneStep';
import DialogueStep from './DialogueStep';
import NarrationStep from './NarrationStep';
import ImpactStep from './ImpactStep';
import RevealTitleStep from './RevealTitleStep';
import OutroStep from './OutroStep';

// v2 fallback components
import HookStep from '@/components/story/HookStep';
import StoryStep from '@/components/story/StoryStep';
import RevealStep from '@/components/story/RevealStep';
import ActionStep from '@/components/story/ActionStep';

interface CinematicRendererProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
}

export default function CinematicRenderer({ step, card, isActive, nextCard }: CinematicRendererProps) {
  // Ensure step content is never empty
  const safeStep = {
    ...step,
    content: step.content?.trim() || '...'
  };

  // v3 cinematic types
  switch (safeStep.type) {
    case 'cinematic-hook':
      return <CinematicHook step={safeStep} card={card} isActive={isActive} />;

    case 'scene':
      return <SceneStep step={safeStep} card={card} isActive={isActive} />;

    case 'dialogue':
      return <DialogueStep step={safeStep} card={card} isActive={isActive} />;

    case 'narration':
      return <NarrationStep step={safeStep} card={card} isActive={isActive} />;

    case 'impact':
      return <ImpactStep step={safeStep} card={card} isActive={isActive} />;

    case 'reveal-title':
      return <RevealTitleStep step={safeStep} card={card} isActive={isActive} />;

    case 'outro':
      return <OutroStep step={safeStep} card={card} isActive={isActive} nextCard={nextCard} />;

    // v2 fallback types
    case 'hook':
      return <HookStep step={safeStep} card={card} isActive={isActive} />;

    case 'story':
    case 'detail':
    case 'example':
      return <StoryStep step={safeStep} card={card} isActive={isActive} />;

    case 'reveal':
    case 'tip':
    case 'compare':
      return <RevealStep step={safeStep} card={card} isActive={isActive} />;

    case 'action':
    case 'quiz':
      return <ActionStep step={safeStep} card={card} isActive={isActive} />;

    // Default fallback
    default:
      return <NarrationStep step={safeStep} card={card} isActive={isActive} />;
  }
}
