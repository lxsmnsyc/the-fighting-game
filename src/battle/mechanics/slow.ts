import { MAX_COOLDOWN_INCREASE, MAX_COOLDOWN_STACKS, NATURAL_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { Energy, ValuePriority } from '../types';

// Slow has no effect of its own, apart from lengthening ability
// cooldowns. It ticks so that it wears off.
export default function setupSlowMechanics(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy === Energy.Slow) {
      event.duration = NATURAL_PERIOD;
    }
  });

  battle.on(BattleEvents.CheckUnitAbilityCooldown, ValuePriority.Multiplicative, (event) => {
    const slow = Math.min(event.source.getTotalEnergy(Energy.Slow), MAX_COOLDOWN_STACKS);
    event.duration *= 1 + (MAX_COOLDOWN_INCREASE * slow) / MAX_COOLDOWN_STACKS;
  });
}
