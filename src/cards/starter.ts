import { BattleEvents } from '../battle/events';
import { Energy } from '../battle/types';
import { EventPriority } from '../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { type Card, createCard } from '../game/card';
import { type Description, describe, token } from '../game/description';
import { Aspect, Rarity } from '../game/types';
import { type EnergyCardOptions, addEnergyOnTrigger, describeGrant } from './effects';
import CardId from './ids';

const DEFAULT_AMOUNT = 5;
const DEFAULT_PERIOD = 1000;

/**
 * Hands out energy every period while the unit stands.
 */
function createStarterCard({
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
    rarity: Rarity.Starter,
    aspect: [aspect],
    description(): Description {
      return describe`Every ${token.seconds(DEFAULT_PERIOD)}, ${describeGrant(energy, amount, 'a random enemy')}.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      let elapsed = 0;

      return new MergedLifecycle([
        battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
          if (!unit.alive) {
            return;
          }
          elapsed += event.duration;
          if (elapsed < DEFAULT_PERIOD) {
            return;
          }
          elapsed -= DEFAULT_PERIOD;
          const target = unit.checkEnergyTarget(energy);
          if (target) {
            unit.triggerCard(card, target, card.getValue(amount, unit.rng));
          }
        }),
        addEnergyOnTrigger(battle, card, energy, false),
      ]);
    },
  });
}

const STARTER_CARDS: Card[] = [
  createStarterCard({
    id: CardId.Fortify,
    name: 'Fortify',
    aspect: Aspect.Armor,
    energy: Energy.Armor,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Sharpen,
    name: 'Sharpen',
    aspect: Aspect.Attack,
    energy: Energy.Attack,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Corrode,
    name: 'Corrode',
    aspect: Aspect.Corrosion,
    energy: Energy.Corrosion,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Focus,
    name: 'Focus',
    aspect: Aspect.Critical,
    energy: Energy.Critical,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Evade,
    name: 'Evade',
    aspect: Aspect.Dodge,
    energy: Energy.Dodge,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Mend,
    name: 'Mend',
    aspect: Aspect.Healing,
    energy: Energy.Healing,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Channel,
    name: 'Channel',
    aspect: Aspect.Magic,
    energy: Energy.Magic,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Envenom,
    name: 'Envenom',
    aspect: Aspect.Poison,
    energy: Energy.Poison,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Hinder,
    name: 'Hinder',
    aspect: Aspect.Slow,
    energy: Energy.Slow,
    amount: DEFAULT_AMOUNT,
  }),
  createStarterCard({
    id: CardId.Hasten,
    name: 'Hasten',
    aspect: Aspect.Speed,
    energy: Energy.Speed,
    amount: DEFAULT_AMOUNT,
  }),
];

export default STARTER_CARDS;
