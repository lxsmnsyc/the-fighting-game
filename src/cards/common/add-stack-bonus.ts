import { SELF_STACK } from '../../battle/constants';
import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import { type Card, applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import type { EnergyCardOptions } from '../effects';
import CardId from '../ids';

const DEFAULT_AMOUNT = 20;

/**
 * Adds a flat bonus whenever the energy is gained: by the unit itself
 * for energies that stack on their owner, and by an enemy otherwise.
 */
function createAddEnergyBonusCard({
  id,
  name,
  energy,
  aspect,
  amount,
  permanent = false,
  image = '',
}: EnergyCardOptions): Card {
  return createCard({
    id,
    name,
    image,
    rarity: Rarity.Common,
    aspect: [aspect],
    description(print): Description {
      const gained = token.energy(energy);
      const bonus = token.value(applyPrint(amount, print));
      return SELF_STACK[energy]
        ? describe`Whenever you gain ${gained}, gain ${bonus} more.`
        : describe`Whenever an enemy gains ${gained}, it gains ${bonus} more.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Additive, (event) => {
        const receives = SELF_STACK[energy]
          ? event.source === unit
          : event.source.team.alliance !== unit.team.alliance;

        if (event.energy !== energy || event.permanent !== permanent || !receives) {
          return;
        }
        const bonus = card.getValue(amount, unit.rng);
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
    id: CardId.Ferocious,
    name: 'Ferocious',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Arcane,
    name: 'Arcane',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Toxic,
    name: 'Toxic',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  // Supportive cards
  createAddEnergyBonusCard({
    id: CardId.Sturdy,
    name: 'Sturdy',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Caustic,
    name: 'Caustic',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Swift,
    name: 'Swift',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Sluggish,
    name: 'Sluggish',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Nimble,
    name: 'Nimble',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Keen,
    name: 'Keen',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyBonusCard({
    id: CardId.Vital,
    name: 'Vital',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
    amount: DEFAULT_AMOUNT,
  }),
];

export default ADD_STACK_BONUS_CARDS;
