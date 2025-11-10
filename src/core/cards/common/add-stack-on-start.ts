import { type Card, type CardContext, createCard } from '../../card';
import { SELF_STACK } from '../../constants';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  Energy,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  ValuePriority,
} from '../../types';

interface AddEnergyOnStartCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

function createAddEnergyOnStartCard({
  name,
  energy,
  aspect,
  amount,
  permanent = false,
  image = '',
}: AddEnergyOnStartCardOptions): Card {
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
          round.addEnergy(
            energy,
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
          round.on(RoundEvents.SetupUnit, ValuePriority.Post, ({ source }) => {
            if (source.owner === context.card.owner && context.card.enabled) {
              const target = SELF_STACK[energy]
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
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: 20,
  }),
  // Supportive cards
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: 20,
  }),
  createAddEnergyOnStartCard({
    name: '',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
    amount: 20,
  }),
];
