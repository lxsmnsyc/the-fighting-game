import { SELF_STACK } from '../../battle/constants';
import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

interface AddEnergyBonusCardOptions {
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  permanent?: boolean;
  image?: string;
}

/**
 * Adds a flat bonus whenever the energy is gained: by the unit itself
 * for energies that stack on their owner, and by an enemy otherwise.
 */
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
    setup({ battle, unit, card }): Lifecycle {
      return battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Additive, (event) => {
        const receives = SELF_STACK[energy]
          ? event.source === unit
          : event.source.team.alliance !== unit.team.alliance;

        if (event.energy !== energy || event.permanent !== permanent || !receives) {
          return;
        }
        const bonus = card.getValue(amount);
        if (unit.triggerCard(card, event.source, bonus)) {
          event.value += bonus;
        }
      });
    },
  });
}

const ADD_STACK_BONUS_CARDS: Card[] = [
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

export default ADD_STACK_BONUS_CARDS;
