import { BattleEvents } from '../../battle/events';
import { Energy } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, applyPrint, createCard } from '../../game/card';
import { type Description, describe } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import { type EnergyCardOptions, addEnergyOnTrigger, describeGrant } from '../effects';
import CardId from '../ids';

// High, since it only triggers once per battle
const DEFAULT_AMOUNT = 80;

/**
 * Hands out energy when the unit enters the battle.
 */
function createAddEnergyOnStartCard({
  id,
  name,
  energy,
  aspect,
  amount,
  image = '',
}: EnergyCardOptions): Card {
  return createCard({
    id,
    name,
    image,
    rarity: Rarity.Uncommon,
    aspect: [aspect],
    description(print): Description {
      return describe`At the start of battle, ${describeGrant(energy, applyPrint(amount, print), 'a random enemy')}.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
          if (event.source !== unit) {
            return;
          }
          const target = unit.checkEnergyTarget(energy);
          if (target) {
            unit.triggerCard(card, target, card.getValue(amount, unit.rng));
          }
        }),
        addEnergyOnTrigger(battle, card, energy),
      ]);
    },
  });
}

const ADD_STACK_ON_START_CARDS: Card[] = [
  // Offensive cards
  createAddEnergyOnStartCard({
    id: CardId.Ambush,
    name: 'Ambush',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Invoke,
    name: 'Invoke',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Taint,
    name: 'Taint',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  // Supportive cards
  createAddEnergyOnStartCard({
    id: CardId.Brace,
    name: 'Brace',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Rust,
    name: 'Rust',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Sprint,
    name: 'Sprint',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Ensnare,
    name: 'Ensnare',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Sidestep,
    name: 'Sidestep',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Aim,
    name: 'Aim',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnStartCard({
    id: CardId.Rejuvenate,
    name: 'Rejuvenate',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
    amount: DEFAULT_AMOUNT,
  }),
];

export default ADD_STACK_ON_START_CARDS;
