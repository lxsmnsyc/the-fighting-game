import { type Card, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  TriggerFlags,
  Rarity,
  RoundEvents,
  Stack,
} from '../../types';

const DEFAULT_CHANCE = 0.2;

interface AddStackOnHealCardOptions {
  name: string;
  stack: Stack;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddStackOnHealCard({
  name,
  stack,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddStackOnHealCardOptions): Card {
  return createCard({
    name,
    aspect: [Aspect.Healing, aspect],
    image,
    rarity: Rarity.Common,
    load(context) {
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

      context.game.on(
        GameEvents.StartRound,
        EventPriority.Exact,
        ({ round }) => {
          round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
            if (source.owner !== context.card.owner) {
              return;
            }
            round.on(RoundEvents.Heal, EventPriority.Post, event => {
              if (
                context.card.enabled &&
                event.source === source &&
                !(event.flag & TriggerFlags.Disabled) &&
                context.card.rng.random() <= DEFAULT_CHANCE
              ) {
                const target = SELF_STACK[stack]
                  ? source
                  : round.getEnemyUnit(source);
                context.game.triggerCard(context.card, {
                  target,
                  round,
                });
              }
            });
          });
        },
      );
    },
  });
}

export const ADD_STACK_ON_HEAL_CARDS = [
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Armor,
    aspect: Aspect.Armor,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Attack,
    aspect: Aspect.Attack,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Critical,
    aspect: Aspect.Critical,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Dodge,
    aspect: Aspect.Dodge,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Magic,
    aspect: Aspect.Magic,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Poison,
    aspect: Aspect.Poison,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Slow,
    aspect: Aspect.Slow,
    amount: 50,
  }),
  createAddStackOnHealCard({
    name: '',
    stack: Stack.Speed,
    aspect: Aspect.Speed,
    amount: 50,
  }),
];
