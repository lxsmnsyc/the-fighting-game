import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';
import addEnergyOnTrigger from '../effects';

const DEFAULT_CHANCE = 0.2;

interface AddEnergyOnHealCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

/**
 * Has a chance to hand out energy whenever the unit is healed.
 */
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
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitHeal, ValuePriority.Post, (event) => {
          // TODO PRD
          if (event.target !== unit || unit.rng.random() > DEFAULT_CHANCE) {
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

const ADD_STACK_ON_HEAL_CARDS: Card[] = [
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

export default ADD_STACK_ON_HEAL_CARDS;
