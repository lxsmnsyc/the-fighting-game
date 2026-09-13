import { EventPriority } from '../../core/event-emitter';
import { BASE_ENERGY_GAIN, ENERGY_GAIN_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { ENERGIES, ValuePriority } from '../types';
import type Unit from '../unit';

/**
 * Every standing unit hands out some of each energy on its own, once per
 * period. It gains the energies that stack on their owner, and gives the
 * rest to an enemy.
 */
export default function setupEnergyGainMechanics(battle: Battle): void {
  // Time since each unit last gained energy
  const clocks = new Map<Unit, number>();

  battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
    if (event.source.alive) {
      clocks.set(event.source, 0);
    }
  });

  battle.on(BattleEvents.UnitFaints, EventPriority.Post, (event) => {
    clocks.delete(event.source);
  });

  battle.on(BattleEvents.TeamRemoveUnit, EventPriority.Post, (event) => {
    clocks.delete(event.unit);
  });

  battle.on(BattleEvents.CheckUnitEnergyGain, ValuePriority.Initial, (event) => {
    event.value = BASE_ENERGY_GAIN;
  });

  battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
    for (const [unit, elapsed] of Array.from(clocks)) {
      const next = elapsed + event.duration;
      if (next < ENERGY_GAIN_PERIOD) {
        clocks.set(unit, next);
        continue;
      }
      clocks.set(unit, next - ENERGY_GAIN_PERIOD);
      for (const energy of ENERGIES) {
        // A gain may knock a unit out mid-loop
        if (!unit.alive) {
          break;
        }
        const target = unit.checkEnergyTarget(energy);
        if (target) {
          target.addEnergy(energy, unit.checkEnergyGain(energy), false);
        }
      }
    }
  });
}
