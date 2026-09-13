import { COUNTERS, SELF_STACK } from '../../battle/constants';
import { BattleEvents, type UnitEnergyEvent } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe, token } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  { id: CardId.Resilient, name: 'Resilient', energy: Energy.Armor, aspect: [Aspect.Armor] },
  { id: CardId.Unhindered, name: 'Unhindered', energy: Energy.Speed, aspect: [Aspect.Speed] },
  { id: CardId.Slippery, name: 'Slippery', energy: Energy.Dodge, aspect: [Aspect.Dodge] },
];

/**
 * Has a chance to hand out energy whenever the unit gains Armor or
 * Speed that cancels the Corrosion or Slow an enemy put on it.
 */
const ADD_STACK_ON_COUNTER_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 20,
    chance: 0.25,
    when: describe`When your ${token.energy(Energy.Armor)} or ${token.energy(Energy.Speed)} cancels ${token.energy(Energy.Corrosion)} or ${token.energy(Energy.Slow)}`,
    receiver: 'a random enemy',
    listen({ battle, unit }, trigger): Lifecycle {
      // Gains that will cancel energy, seen before the energy mechanics
      // apply them
      const cancelling = new WeakSet<UnitEnergyEvent>();

      return new MergedLifecycle([
        battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Pre, (event) => {
          const counter = COUNTERS[event.energy];
          if (
            event.source === unit &&
            SELF_STACK[event.energy] &&
            !event.permanent &&
            counter != null &&
            unit.getEnergy(counter, false) > 0
          ) {
            cancelling.add(event);
          }
        }),
        battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Post, (event) => {
          if (cancelling.delete(event)) {
            trigger();
          }
        }),
      ]);
    },
  }),
);

export default ADD_STACK_ON_COUNTER_CARDS;
