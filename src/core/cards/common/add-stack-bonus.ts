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

interface AddStackBonusCardOptions {
  name: string;
  stack: Stack;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddStackBonusCard({
  name,
  stack,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddStackBonusCardOptions): Card {
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
            (data as SetStackEvent).amount += context.card.getValue(amount);
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
                target === event.source &&
                event.permanent === permanent
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
  createAddStackBonusCard({
    name: '',
    stack: Stack.Attack,
    aspect: Aspect.Attack,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Magic,
    aspect: Aspect.Magic,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Poison,
    aspect: Aspect.Poison,
    amount: 20,
  }),
  // Supportive cards
  createAddStackBonusCard({
    name: '',
    stack: Stack.Armor,
    aspect: Aspect.Armor,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Speed,
    aspect: Aspect.Speed,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Slow,
    aspect: Aspect.Slow,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Dodge,
    aspect: Aspect.Dodge,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Critical,
    aspect: Aspect.Critical,
    amount: 20,
  }),
  createAddStackBonusCard({
    name: '',
    stack: Stack.Healing,
    aspect: Aspect.Healing,
    amount: 20,
  }),
];
