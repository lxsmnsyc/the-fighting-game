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

interface AddStackOnStartCardOptions {
  name: string;
  stack: Stack;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddStackOnStartCard({
  name,
  stack,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddStackOnStartCardOptions): Card {
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
            context.card.getValue(amount),
            permanent,
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
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Attack,
    aspect: Aspect.Attack,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Magic,
    aspect: Aspect.Magic,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Poison,
    aspect: Aspect.Poison,
    amount: 20,
  }),
  // Supportive cards
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Armor,
    aspect: Aspect.Armor,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Speed,
    aspect: Aspect.Speed,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Slow,
    aspect: Aspect.Slow,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Dodge,
    aspect: Aspect.Dodge,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Critical,
    aspect: Aspect.Critical,
    amount: 20,
  }),
  createAddStackOnStartCard({
    name: '',
    stack: Stack.Healing,
    aspect: Aspect.Healing,
    amount: 20,
  }),
];
