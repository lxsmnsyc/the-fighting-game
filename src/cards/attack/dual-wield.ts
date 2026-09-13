import { BattleEvents } from '../../battle/events';
import type { UnitActionEvent } from '../../battle/events';
import { AttackFlags } from '../../battle/flags';
import { ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

const DEFAULT_MULTIPLIER = 0.5;

function isNaturalAttack(event: UnitActionEvent): boolean {
  return (event.flags & AttackFlags.Natural) !== 0 && (event.flags & AttackFlags.Echo) === 0;
}

/**
 * Causes natural Attack to deal 50% damage but repeats the Attack
 * with the same amount immediately.
 *
 * Second attack does not consume energy.
 */
export default createCard({
  name: 'Dual Wield',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack],
  setup({ battle, unit, card }): Lifecycle {
    return new MergedLifecycle([
      // Reduce the main attack
      battle.on(BattleEvents.UnitAttack, ValuePriority.Pre, (event) => {
        if (event.source === unit && isNaturalAttack(event)) {
          event.value *= card.getValue(DEFAULT_MULTIPLIER);
        }
      }),
      // Repeat it
      battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
        if (event.source === unit && isNaturalAttack(event)) {
          unit.triggerCard(card, event.target, event.value);
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
