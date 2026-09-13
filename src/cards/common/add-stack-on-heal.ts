import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import { type EnergyCardOptions, addEnergyOnTrigger, describeGrant } from '../effects';
import CardId from '../ids';

const DEFAULT_AMOUNT = 50;
const DEFAULT_CHANCE = 0.2;

/**
 * Has a chance to hand out energy whenever the unit is healed.
 */
function createAddEnergyOnHealCard({
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
    aspect: [Aspect.Healing, aspect],
    image,
    rarity: Rarity.Common,
    description(): Description {
      return describe`When healed, ${token.percent(DEFAULT_CHANCE)} chance to ${describeGrant(energy, amount, 'a random enemy')}.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitHeal, ValuePriority.Post, (event) => {
          // TODO PRD
          if (event.target !== unit || unit.rng.random() > DEFAULT_CHANCE) {
            return;
          }
          const target = unit.checkEnergyTarget(energy);
          if (target) {
            unit.triggerCard(card, target, card.getValue(amount, unit.rng));
          }
        }),
        addEnergyOnTrigger(battle, card, energy, permanent),
      ]);
    },
  });
}

const ADD_STACK_ON_HEAL_CARDS: Card[] = [
  createAddEnergyOnHealCard({
    id: CardId.Harden,
    name: 'Harden',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Rally,
    name: 'Rally',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Fester,
    name: 'Fester',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Steady,
    name: 'Steady',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Limber,
    name: 'Limber',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Meditate,
    name: 'Meditate',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Blight,
    name: 'Blight',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Numb,
    name: 'Numb',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealCard({
    id: CardId.Refresh,
    name: 'Refresh',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: DEFAULT_AMOUNT,
  }),
];

export default ADD_STACK_ON_HEAL_CARDS;
