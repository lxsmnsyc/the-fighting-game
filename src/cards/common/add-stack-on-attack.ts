import { SELF_STACK } from '../../battle/constants';
import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import { type EnergyCardOptions, addEnergyOnTrigger, describeGrant } from '../effects';
import CardId from '../ids';

const DEFAULT_AMOUNT = 20;
const DEFAULT_CHANCE = 0.25;

/**
 * Has a chance to hand out energy whenever the unit attacks. The unit
 * gains friendly energy, and the attacked enemy gains unfriendly energy.
 */
function createAddEnergyOnAttackCard({
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
    rarity: Rarity.Common,
    aspect: [Aspect.Attack, aspect],
    description(print): Description {
      return describe`When attacking, ${token.percent(DEFAULT_CHANCE)} chance to ${describeGrant(energy, applyPrint(amount, print), 'the target')}.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
          // TODO PRD
          if (event.source !== unit || unit.rng.random() > DEFAULT_CHANCE) {
            return;
          }
          const target = SELF_STACK[energy] ? unit : event.target;
          unit.triggerCard(card, target, card.getValue(amount, unit.rng));
        }),
        addEnergyOnTrigger(battle, card, energy),
      ]);
    },
  });
}

const ADD_STACK_ON_ATTACK_CARDS: Card[] = [
  // Friendly energy, gained by the attacker
  createAddEnergyOnAttackCard({
    id: CardId.Frenzied,
    name: 'Frenzied',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Enchanted,
    name: 'Enchanted',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Guarded,
    name: 'Guarded',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Quicken,
    name: 'Quicken',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Agile,
    name: 'Agile',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Precise,
    name: 'Precise',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Renew,
    name: 'Renew',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
    amount: DEFAULT_AMOUNT,
  }),
  // Unfriendly energy, given to the attacked enemy
  createAddEnergyOnAttackCard({
    id: CardId.Poison,
    name: 'Poison',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Erode,
    name: 'Erode',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnAttackCard({
    id: CardId.Hamstring,
    name: 'Hamstring',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: DEFAULT_AMOUNT,
  }),
];

export default ADD_STACK_ON_ATTACK_CARDS;
