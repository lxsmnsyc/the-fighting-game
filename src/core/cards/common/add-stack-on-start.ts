import { type Card, type CardContext, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  Stack,
} from '../../types';

const DEFAULT_MULTIPLIER = 20;

function createAddStackOnStartCard(
  name: string,
  stack: Stack,
  aspect: Aspect,
  image = '',
): Card {
  return createCard({
    name,
    image,
    rarity: Rarity.Common,
    aspect: [aspect],
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
            true,
          );
        }
      });
      // Trigger condition
      context.game.on(
        GameEvents.StartRound,
        EventPriority.Post,
        ({ round }) => {
          round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
            if (source.owner === context.card.owner && context.card.enabled) {
              const target = SELF_STACK[stack]
                ? source
                : round.getEnemyUnit(source);
              context.game.triggerCard(context.card, { round, target });
            }
          });
        },
      );
    },
  });
}

export const ADD_STACK_ON_START_CARDS = [
  // Offensive cards
  createAddStackOnStartCard('', Stack.Attack, Aspect.Attack),
  createAddStackOnStartCard('', Stack.Magic, Aspect.Magic),
  createAddStackOnStartCard('', Stack.Poison, Aspect.Poison),
  // Supportive cards
  createAddStackOnStartCard('', Stack.Armor, Aspect.Armor),
  createAddStackOnStartCard('', Stack.Corrosion, Aspect.Corrosion),
  createAddStackOnStartCard('', Stack.Speed, Aspect.Speed),
  createAddStackOnStartCard('', Stack.Slow, Aspect.Slow),
  createAddStackOnStartCard('', Stack.Dodge, Aspect.Dodge),
  createAddStackOnStartCard('', Stack.Critical, Aspect.Critical),
  createAddStackOnStartCard('', Stack.Healing, Aspect.Healing),
];
