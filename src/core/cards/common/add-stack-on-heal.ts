import { type Card, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  HealingFlags,
  Rarity,
  RoundEvents,
  Stack,
} from '../../types';

const DEFAULT_AMOUNT = 10;
const DEFAULT_CHANCE = 0.2;

function createAddStackOnHealCard(
  name: string,
  stack: Stack,
  aspect: Aspect,
  permanent = false,
  image = '',
): Card {
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
            context.card.getCardValue(DEFAULT_AMOUNT),
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
                !(event.flag & HealingFlags.Missed) &&
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
  createAddStackOnHealCard('', Stack.Armor, Aspect.Armor),
  createAddStackOnHealCard('', Stack.Attack, Aspect.Attack),
  createAddStackOnHealCard('', Stack.Corrosion, Aspect.Corrosion),
  createAddStackOnHealCard('', Stack.Critical, Aspect.Critical),
  createAddStackOnHealCard('', Stack.Dodge, Aspect.Dodge),
  createAddStackOnHealCard('', Stack.Magic, Aspect.Magic),
  createAddStackOnHealCard('', Stack.Poison, Aspect.Poison),
  createAddStackOnHealCard('', Stack.Slow, Aspect.Slow),
  createAddStackOnHealCard('', Stack.Speed, Aspect.Speed),
];
