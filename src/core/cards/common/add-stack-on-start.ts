import { type Card, type CardContext, createCard } from '../../card';
import {
  Aspect,
  EventPriority,
  GameEventType,
  Rarity,
  RoundEventType,
  Stack,
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
      context.game.on(
        GameEventType.NextRound,
        EventPriority.Exact,
        ({ round }) => {
          round.on(RoundEventType.Start, EventPriority.Post, () => {
            const unit =
              context.card.owner === round.unitA.owner
                ? round.unitA
                : round.unitB;
            const target = SELF_STACK[stack] ? unit : round.getEnemyUnit(unit);
            if (context.card.enabled) {
              round.addStack(
                stack,
                target,
                DEFAULT_MULTIPLIER * context.card.getMultiplier(),
              );
            }
          });
        },
      );
    },
  });
}

export default [
  // Offensive cards
  createAddStackOnStartCard('', Stack.Attack, [Aspect.Attack]),
  createAddStackOnStartCard('', Stack.Magic, [Aspect.Magic]),
  createAddStackOnStartCard('', Stack.Poison, [Aspect.Poison]),
  // Supportive cards
  createAddStackOnStartCard('', Stack.Armor, [Aspect.Armor]),
  createAddStackOnStartCard('', Stack.Corrosion, [Aspect.Corrosion]),
  createAddStackOnStartCard('', Stack.Speed, [Aspect.Speed]),
  createAddStackOnStartCard('', Stack.Slow, [Aspect.Slow]),
  createAddStackOnStartCard('', Stack.Evasion, [Aspect.Evasion]),
  createAddStackOnStartCard('', Stack.Critical, [Aspect.Critical]),
  createAddStackOnStartCard('', Stack.Healing, [Aspect.Healing]),
];
