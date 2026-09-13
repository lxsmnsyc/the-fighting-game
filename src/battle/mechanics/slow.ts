import { NATURAL_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { Energy, ValuePriority } from '../types';

// Slow has no effect of its own. It ticks so that it wears off.
export default function setupSlowMechanics(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy === Energy.Slow) {
      event.duration = NATURAL_PERIOD;
    }
  });
}
