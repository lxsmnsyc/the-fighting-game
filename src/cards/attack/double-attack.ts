import { BattleEvents } from '../../battle/events';
import { AttackFlags } from '../../battle/flags';
import { ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

const DEFAULT_CHANCE = 0.25;
const DEFAULT_MULTIPLIER = 1.0;

/**
 * Natural attacks have a 25% chance to do another Natural Attack with
 * 100% of the amount.
 *
 * Does not consume energy. Does not trigger itself.
 */
export default createCard({
  name: 'Double Attack',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack],
  setup({ battle, unit, card }): Lifecycle {
    return new MergedLifecycle([
      battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
        if (
          event.source !== unit ||
          (event.flags & AttackFlags.Echo) !== 0 ||
          (event.flags & (AttackFlags.Natural | AttackFlags.Tick)) === 0
        ) {
          return;
        }
        // TODO use PRD
        if (unit.rng.random() <= DEFAULT_CHANCE) {
          unit.triggerCard(card, event.target, event.value * card.getValue(DEFAULT_MULTIPLIER));
        }
      }),
      battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
        if (event.card === card) {
          unit.attack(event.target, event.value, AttackFlags.Natural | AttackFlags.Echo);
        }
      }),
    ]);
  },
});
