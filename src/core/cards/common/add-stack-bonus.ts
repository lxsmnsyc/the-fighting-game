import { type Card, type CardContext, createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
import type { SetStackEvent } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
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
  [Stack.Dodge]: true,
  [Stack.Poison]: false,
  [Stack.Healing]: true,
  [Stack.Slow]: false,
  [Stack.Speed]: true,
};

function createAddStackBonusCard(
  name: string,
  stack: Stack,
  aspect: Aspect[],
  image = '',
): Card {
  return createCard({
    name,
    image,
    rarity: Rarity.Common,
    aspect,
    load(context: CardContext): void {
      // Trigger card
      context.game.on(
        GameEvents.TriggerCard,
        EventPriority.Exact,
        ({ card, data }) => {
          if (card === context.card) {
            (data as SetStackEvent).amount +=
              DEFAULT_MULTIPLIER * context.card.getMultiplier();
          }
        },
      );
      // Trigger condition
      context.game.on(
        GameEvents.StartRound,
        EventPriority.Exact,
        ({ round }: StartRoundGameEvent) => {
          round.on(RoundEvents.AddStack, StackPriority.Additive, event => {
            const target = SELF_STACK[stack]
              ? event.source.owner
              : round.getEnemyUnit(event.source).owner;
            if (event.type === stack && target === context.card.owner) {
              context.game.triggerCard(context.card, event);
            }
          });
        },
      );
    },
  });
}

export const ADD_STACK_BONUS_CARDS = [
  // Offensive cards
  createAddStackBonusCard('', Stack.Attack, [Aspect.Attack]),
  createAddStackBonusCard('', Stack.Magic, [Aspect.Magic]),
  createAddStackBonusCard('', Stack.Poison, [Aspect.Poison]),
  // Supportive cards
  createAddStackBonusCard('', Stack.Armor, [Aspect.Armor]),
  createAddStackBonusCard('', Stack.Corrosion, [Aspect.Corrosion]),
  createAddStackBonusCard('', Stack.Speed, [Aspect.Speed]),
  createAddStackBonusCard('', Stack.Slow, [Aspect.Slow]),
  createAddStackBonusCard('', Stack.Dodge, [Aspect.Dodge]),
  createAddStackBonusCard('', Stack.Critical, [Aspect.Critical]),
  createAddStackBonusCard('', Stack.Healing, [Aspect.Healing]),
];
