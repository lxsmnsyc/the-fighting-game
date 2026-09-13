import { BattleEvents } from '../battle/events';
import { Energy } from '../battle/types';
import { EventPriority } from '../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { type Card, createCard } from '../game/card';
import { Aspect, Rarity } from '../game/types';
import addEnergyOnTrigger from './effects';

interface AspectOptions {
  name: string;
  image: string;
  amount: number;
  period: number;
  aspect: Aspect;
  energy: Energy;
}

/**
 * Hands out energy every period while the unit stands.
 */
function createAspect({ name, image, aspect, amount, period, energy }: AspectOptions): Card {
  return createCard({
    name,
    image,
    rarity: Rarity.Starter,
    aspect: [aspect],
    setup({ battle, unit, card }): Lifecycle {
      let elapsed = 0;

      return new MergedLifecycle([
        battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
          if (!unit.alive) {
            return;
          }
          elapsed += event.duration;
          if (elapsed < period) {
            return;
          }
          elapsed -= period;
          const target = unit.checkEnergyTarget(energy);
          if (target) {
            unit.triggerCard(card, target, card.getValue(amount));
          }
        }),
        addEnergyOnTrigger(battle, card, energy, false),
      ]);
    },
  });
}

const STARTER_CARDS: Card[] = [
  createAspect({
    name: 'Aspect of Armor',
    image: '',
    aspect: Aspect.Armor,
    energy: Energy.Armor,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Attack',
    image: '',
    aspect: Aspect.Attack,
    energy: Energy.Attack,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Corrosion',
    image: '',
    aspect: Aspect.Corrosion,
    energy: Energy.Corrosion,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Critical',
    image: '',
    aspect: Aspect.Critical,
    energy: Energy.Critical,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Dodge',
    image: '',
    aspect: Aspect.Dodge,
    energy: Energy.Dodge,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Healing',
    image: '',
    aspect: Aspect.Healing,
    energy: Energy.Healing,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Magic',
    image: '',
    aspect: Aspect.Magic,
    energy: Energy.Magic,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Poison',
    image: '',
    aspect: Aspect.Poison,
    energy: Energy.Poison,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Slow',
    image: '',
    aspect: Aspect.Slow,
    energy: Energy.Slow,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Speed',
    image: '',
    aspect: Aspect.Speed,
    energy: Energy.Speed,
    amount: 5,
    period: 1000,
  }),
];

export default STARTER_CARDS;
