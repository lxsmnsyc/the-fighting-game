import { SELF_STACK } from '../../battle/constants';
import { BattleEvents } from '../../battle/events';
import { TriggerEnergyFlags } from '../../battle/flags';
import { Energy, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { type Description, describe } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import { type EnergyCardOptions, addEnergyOnTrigger, describeGrant } from '../effects';
import CardId from '../ids';

const DEFAULT_AMOUNT = 30;

/**
 * Hands out energy whenever the unit lands a critical hit. The unit
 * gains friendly energy, and the enemy that was hit gains unfriendly
 * energy.
 */
function createAddEnergyOnCriticalCard({
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
    aspect: [Aspect.Critical, aspect],
    description(): Description {
      return describe`On a critical hit, ${describeGrant(energy, amount, 'the target')}.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitCritical, ValuePriority.Post, (event) => {
          if (event.source !== unit || (event.flags & TriggerEnergyFlags.Failed) !== 0) {
            return;
          }
          const target = SELF_STACK[energy] ? unit : event.parent.target;
          unit.triggerCard(card, target, card.getValue(amount, unit.rng));
        }),
        addEnergyOnTrigger(battle, card, energy, permanent),
      ]);
    },
  });
}

const ADD_STACK_ON_CRITICAL_CARDS: Card[] = [
  // Friendly energy, gained by the attacker
  createAddEnergyOnCriticalCard({
    id: CardId.Exploit,
    name: 'Exploit',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Empower,
    name: 'Empower',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Bolster,
    name: 'Bolster',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Accelerate,
    name: 'Accelerate',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Elusive,
    name: 'Elusive',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Deadly,
    name: 'Deadly',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Revitalize,
    name: 'Revitalize',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
    amount: DEFAULT_AMOUNT,
  }),
  // Unfriendly energy, given to the enemy that was hit
  createAddEnergyOnCriticalCard({
    id: CardId.Infect,
    name: 'Infect',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Shatter,
    name: 'Shatter',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnCriticalCard({
    id: CardId.Stagger,
    name: 'Stagger',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: DEFAULT_AMOUNT,
  }),
];

export default ADD_STACK_ON_CRITICAL_CARDS;
