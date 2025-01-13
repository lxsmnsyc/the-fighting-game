import { type Card, type CardContext, createCard } from '../../card';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  Stack,
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

function createAddStackOnStartCard(
  name: string,
  stack: Stack,
  aspect: Aspect[],
): Card {
  return createCard({
    name,
    rarity: Rarity.Common,
    aspect,
    load(context: CardContext): void {
      // Trigger card
      context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
        if (event.card === context.card) {
          const { round, target } = event.data as {
            round: Round;
            target: Unit;
          };
          round.addStack(
            stack,
            target,
            DEFAULT_MULTIPLIER * context.card.getMultiplier(),
          );
        }
      });
      // Trigger condition
      context.game.on(
        GameEvents.StartRound,
        EventPriority.Exact,
        ({ round }) => {
          round.on(RoundEvents.Start, EventPriority.Post, () => {
            const unit = round.getOwnedUnit(context.card.owner);
            const target = SELF_STACK[stack] ? unit : round.getEnemyUnit(unit);
            context.game.triggerCard(context.card, {
              round,
              target,
            });
          });
        },
      );
    },
  });
}

export const ADD_STACK_ON_START_CARDS = [
  // Offensive cards
  createAddStackOnStartCard('', Stack.Attack, [Aspect.Attack]),
  createAddStackOnStartCard('', Stack.Magic, [Aspect.Magic]),
  createAddStackOnStartCard('', Stack.Poison, [Aspect.Poison]),
  // Supportive cards
  createAddStackOnStartCard('', Stack.Armor, [Aspect.Armor]),
  createAddStackOnStartCard('', Stack.Corrosion, [Aspect.Corrosion]),
  createAddStackOnStartCard('', Stack.Speed, [Aspect.Speed]),
  createAddStackOnStartCard('', Stack.Slow, [Aspect.Slow]),
  createAddStackOnStartCard('', Stack.Dodge, [Aspect.Dodge]),
  createAddStackOnStartCard('', Stack.Critical, [Aspect.Critical]),
  createAddStackOnStartCard('', Stack.Healing, [Aspect.Healing]),
];
