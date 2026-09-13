import { NATURAL_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { Energy, ValuePriority } from '../types';

// Speed has no effect of its own. It ticks so that it wears off.
export default function setupSpeedMechanics(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy === Energy.Speed) {
      event.duration = NATURAL_PERIOD;
    }
  });
}
