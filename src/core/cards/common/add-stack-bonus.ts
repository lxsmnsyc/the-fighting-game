import { type Card, type CardContext, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
import type { StartRoundGameEvent } from '../../game';
import type { SetEnergyEvent } from '../../round';
import {
  Aspect,
  Energy,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  ValuePriority,
} from '../../types';

interface AddEnergyBonusCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddEnergyBonusCard({
  name,
  energy,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddEnergyBonusCardOptions): Card {
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
            (data as SetEnergyEvent).amount += context.card.getValue(amount);
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
            round.on(RoundEvents.AddEnergy, ValuePriority.Additive, event => {
              const target = SELF_STACK[energy]
                ? source
                : round.getEnemyUnit(source);
              if (
                context.card.enabled &&
                event.type === energy &&
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
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: 20,
  }),
  // Supportive cards
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: 20,
  }),
  createAddEnergyBonusCard({
    name: '',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
    amount: 20,
  }),
];
