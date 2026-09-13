import { MAX_COOLDOWN_REDUCTION, MAX_COOLDOWN_STACKS, NATURAL_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { Energy, ValuePriority } from '../types';

// Speed has no effect of its own, apart from shortening ability
// cooldowns. It ticks so that it wears off.
export default function setupSpeedMechanics(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy === Energy.Speed) {
      event.duration = NATURAL_PERIOD;
    }
  });

  battle.on(BattleEvents.CheckUnitAbilityCooldown, ValuePriority.Multiplicative, (event) => {
    const speed = Math.min(event.source.getTotalEnergy(Energy.Speed), MAX_COOLDOWN_STACKS);
    event.duration *= 1 - (MAX_COOLDOWN_REDUCTION * speed) / MAX_COOLDOWN_STACKS;
  });
}
