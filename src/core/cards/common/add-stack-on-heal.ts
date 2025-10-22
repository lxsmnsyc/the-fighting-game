import { type Card, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  Energy,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
} from '../../types';

const DEFAULT_CHANCE = 0.2;

interface AddEnergyOnHealCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddEnergyOnHealCard({
  name,
  energy,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddEnergyOnHealCardOptions): Card {
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
          round.addEnergy(
            energy,
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
                event.source.rng.random() <= DEFAULT_CHANCE
              ) {
                const target = SELF_STACK[energy]
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
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: 50,
  }),
  createAddEnergyOnHealCard({
    name: '',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: 50,
  }),
];
