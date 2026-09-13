import { BattleEvents } from '../../battle/events';
import { Energy, Stat, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';
import addEnergyOnTrigger from '../effects';

const DEFAULT_HEALTH_THRESHOLD = 100;

interface AddEnergyOnHealthLostCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

/**
 * Hands out energy for every 100 health the unit loses.
 */
function createAddEnergyOnHealthLostCard({
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
    setup({ battle, unit, card }): Lifecycle {
      let lost = 0;

      return new MergedLifecycle([
        battle.on(BattleEvents.UnitRemoveStat, ValuePriority.Post, (event) => {
          if (event.source !== unit || event.stat !== Stat.Health) {
            return;
          }
          lost += event.value;
          while (lost >= DEFAULT_HEALTH_THRESHOLD) {
            lost -= DEFAULT_HEALTH_THRESHOLD;
            const target = unit.checkEnergyTarget(energy);
            if (target) {
              unit.triggerCard(card, target, card.getValue(amount));
            }
          }
        }),
        addEnergyOnTrigger(battle, card, energy, permanent),
      ]);
    },
  });
}

const ADD_STACK_ON_HEALTH_LOST_CARDS: Card[] = [
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: 50,
  }),
  createAddEnergyOnHealthLostCard({
    name: '',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: 50,
  }),
];

export default ADD_STACK_ON_HEALTH_LOST_CARDS;
