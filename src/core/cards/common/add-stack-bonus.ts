import { type Card, type CardContext, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
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

function createAddStackBonusCard(
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
          round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
            if (source.owner !== context.card.owner) {
              return;
            }
            round.on(RoundEvents.AddStack, StackPriority.Additive, event => {
              const target = SELF_STACK[stack]
                ? source
                : round.getEnemyUnit(source);
              if (
                context.card.enabled &&
                event.type === stack &&
                target === event.source
              ) {
                context.game.triggerCard(context.card, event);
              }
            });
          });
        },
      );
    },
  });
}

export const ADD_STACK_BONUS_CARDS = [
  // Offensive cards
  createAddStackBonusCard('', Stack.Attack, Aspect.Attack),
  createAddStackBonusCard('', Stack.Magic, Aspect.Magic),
  createAddStackBonusCard('', Stack.Poison, Aspect.Poison),
  // Supportive cards
  createAddStackBonusCard('', Stack.Armor, Aspect.Armor),
  createAddStackBonusCard('', Stack.Corrosion, Aspect.Corrosion),
  createAddStackBonusCard('', Stack.Speed, Aspect.Speed),
  createAddStackBonusCard('', Stack.Slow, Aspect.Slow),
  createAddStackBonusCard('', Stack.Dodge, Aspect.Dodge),
  createAddStackBonusCard('', Stack.Critical, Aspect.Critical),
  createAddStackBonusCard('', Stack.Healing, Aspect.Healing),
];
