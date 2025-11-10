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
  Stat,
  ValuePriority,
} from '../../types';

const DEFAULT_HEALTH_THRESHOLD = 100;

interface AddEnergyOnHealthLostCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddEnergyOnStatLostCard({
  name,
  energy,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddEnergyOnHealthLostCardOptions): Card {
  return createCard({
    name,
    aspect: [Aspect.Health, aspect],
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
          round.on(RoundEvents.SetupUnit, ValuePriority.Post, ({ source }) => {
            if (source.owner !== context.card.owner) {
              return;
            }
            let currentHeathLost = 0;
            round.on(RoundEvents.RemoveStat, ValuePriority.Post, event => {
              if (
                context.card.enabled &&
                event.type === Stat.Health &&
                event.source === source
              ) {
                currentHeathLost += event.amount;

                while (currentHeathLost >= DEFAULT_HEALTH_THRESHOLD) {
                  const target = SELF_STACK[energy]
                    ? source
                    : round.getEnemyUnit(source);
                  context.game.triggerCard(context.card, {
                    target,
                    round,
                  });
                  currentHeathLost -= DEFAULT_HEALTH_THRESHOLD;
                }
              }
            });
          });
        },
      );
    },
  });
}

export const ADD_STACK_ON_HEAL_CARDS = [
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: 50,
  }),
  createAddEnergyOnStatLostCard({
    name: '',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: 50,
  }),
];
