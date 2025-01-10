import { type Card, type CardContext, createCard } from '../../card';
import type { NextRoundGameEvent } from '../../game';
import {
  Aspect,
  EventPriority,
  GameEventType,
  Rarity,
  RoundEventType,
  Stack,
  StackPriority,
} from '../../types';

const DEFAULT_MULTIPLIER = 5;

const SELF_STACK: Record<Stack, boolean> = {
  [Stack.Attack]: true,
  [Stack.Magic]: true,
  [Stack.Armor]: true,
  [Stack.Corrosion]: false,
  [Stack.Critical]: true,
  [Stack.Evasion]: true,
  [Stack.Poison]: false,
  [Stack.Healing]: true,
  [Stack.Slow]: false,
  [Stack.Speed]: true,
};

function createAddStackBonusCard(
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

export default [
  // Offensive cards
  createAddStackBonusCard('', Stack.Attack, [Aspect.Attack]),
  createAddStackBonusCard('', Stack.Magic, [Aspect.Magic]),
  createAddStackBonusCard('', Stack.Poison, [Aspect.Poison]),
  // Supportive cards
  createAddStackBonusCard('', Stack.Armor, [Aspect.Armor]),
  createAddStackBonusCard('', Stack.Corrosion, [Aspect.Corrosion]),
  createAddStackBonusCard('', Stack.Speed, [Aspect.Speed]),
  createAddStackBonusCard('', Stack.Slow, [Aspect.Slow]),
  createAddStackBonusCard('', Stack.Evasion, [Aspect.Evasion]),
  createAddStackBonusCard('', Stack.Critical, [Aspect.Critical]),
  createAddStackBonusCard('', Stack.Healing, [Aspect.Healing]),
];
