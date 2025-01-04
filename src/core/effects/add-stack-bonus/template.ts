import { type Card, type CardContext, createCard } from '../../card';
import type { NextRoundGameEvent } from '../../game';
import {
  type Aspect,
  EventPriority,
  GameEventType,
  Rarity,
  RoundEventType,
  Stack,
  StackPriority,
} from '../../types';

const DEFAULT_MULTIPLIER = 5;

const SELF_STACK: Record<Stack, boolean> = {
  [Stack.Armor]: true,
  [Stack.Corrosion]: false,
  [Stack.Curse]: false,
  [Stack.Luck]: true,
  [Stack.Poison]: false,
  [Stack.Recovery]: true,
  [Stack.Slow]: false,
  [Stack.Speed]: true,
};

export default function createAddStackBonusCard(
  name: string,
  stack: Stack,
  aspect: Aspect[],
): Card {
  return createCard({
    name,
    rarity: Rarity.Common,
    aspect,
    load(context: CardContext): void {
      context.game.on(
        GameEventType.NextRound,
        EventPriority.Exact,
        ({ round }: NextRoundGameEvent) => {
          round.on(RoundEventType.AddStack, StackPriority.Additive, event => {
            const target = SELF_STACK[stack]
              ? event.source.owner
              : round.getEnemyUnit(event.source).owner;
            if (
              context.card.enabled &&
              event.type === stack &&
              target === context.card.owner
            ) {
              event.amount += DEFAULT_MULTIPLIER * context.card.getMultiplier();
            }
          });
        },
      );
    },
  });
}
