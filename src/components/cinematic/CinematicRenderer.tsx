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
  // v3 cinematic types
  switch (step.type) {
    case 'cinematic-hook':
      return <CinematicHook step={step} card={card} isActive={isActive} />;

    case 'scene':
      return <SceneStep step={step} card={card} isActive={isActive} />;

    case 'dialogue':
      return <DialogueStep step={step} card={card} isActive={isActive} />;

    case 'narration':
      return <NarrationStep step={step} card={card} isActive={isActive} />;

    case 'impact':
      return <ImpactStep step={step} card={card} isActive={isActive} />;

    case 'reveal-title':
      return <RevealTitleStep step={step} card={card} isActive={isActive} />;

    case 'outro':
      return <OutroStep step={step} card={card} isActive={isActive} nextCard={nextCard} />;

    // v2 fallback types
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
      return <ActionStep step={step} card={card} isActive={isActive} />;

    // Default fallback
    default:
      return <NarrationStep step={step} card={card} isActive={isActive} />;
  }
}
