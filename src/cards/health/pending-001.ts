import { BattleEvents } from '../../battle/events';
import { Energy, Stat, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import { type EnergyCardOptions, addEnergyOnTrigger, describeGrant } from '../effects';
import CardId from '../ids';

const DEFAULT_AMOUNT = 50;
const DEFAULT_HEALTH_THRESHOLD = 100;

/**
 * Hands out energy for every 100 health the unit loses.
 */
function createAddEnergyOnHealthLostCard({
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
    aspect: [Aspect.Health, aspect],
    image,
    rarity: Rarity.Common,
    description(): Description {
      return describe`For every ${token.stat(Stat.Health, DEFAULT_HEALTH_THRESHOLD)} lost, ${describeGrant(energy, amount, 'a random enemy')}.`;
    },
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
    id: CardId.Scarred,
    name: 'Scarred',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Vengeful,
    name: 'Vengeful',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Bitter,
    name: 'Bitter',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Desperate,
    name: 'Desperate',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Wary,
    name: 'Wary',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Anguished,
    name: 'Anguished',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Spiteful,
    name: 'Spiteful',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Crippling,
    name: 'Crippling',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
    amount: DEFAULT_AMOUNT,
  }),
  createAddEnergyOnHealthLostCard({
    id: CardId.Frantic,
    name: 'Frantic',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
    amount: DEFAULT_AMOUNT,
  }),
];

export default ADD_STACK_ON_HEALTH_LOST_CARDS;
