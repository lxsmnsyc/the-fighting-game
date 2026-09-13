import { BattleEvents } from '../../battle/events';
import { Energy } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';
import addEnergyOnTrigger from '../effects';

interface AddEnergyOnStartCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

/**
 * Hands out energy when the unit enters the battle.
 */
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
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
          if (event.source !== unit) {
            return;
          }
          const target = unit.checkEnergyTarget(energy);
          if (target) {
            unit.triggerCard(card, target, card.getValue(amount));
          }
        }),
        addEnergyOnTrigger(battle, card, energy, permanent),
      ]);
    },
  });
}

const ADD_STACK_ON_START_CARDS: Card[] = [
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

export default ADD_STACK_ON_START_CARDS;
