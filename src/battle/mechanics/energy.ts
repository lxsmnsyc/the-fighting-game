import { EventPriority } from '../../core/event-emitter';
import { CONSUMABLE_STACKS, COUNTERS } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { TriggerEnergyFlags } from '../flags';
import { ENERGIES, type UnitEnergy, ValuePriority, createEnergyField } from '../types';
import type Unit from '../unit';

/**
 * What every energy shares: storing it, countering its pair, spending
 * it and triggering it on its own period.
 */
export default function setupEnergyMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitSetEnergy, ValuePriority.Exact, (event) => {
    const field = event.permanent
      ? event.source.energies.permanent
      : event.source.energies.consumable;
    field[event.energy] = Math.max(0, event.value);
  });

  battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Exact, (event) => {
    const { source, energy, permanent } = event;
    const counter = COUNTERS[energy];
    let { value } = event;

    // Only consumable energy counters its pair
    if (!permanent && counter != null) {
      const countered = Math.min(source.getEnergy(counter, false), value);
      source.removeEnergy(counter, countered, false);
      value -= countered;
    }

    if (value > 0) {
      source.setEnergy(energy, source.getEnergy(energy, permanent) + value, permanent);
    }
  });

  battle.on(BattleEvents.UnitRemoveEnergy, ValuePriority.Exact, (event) => {
    const { source, energy, permanent } = event;
    source.setEnergy(energy, source.getEnergy(energy, permanent) - event.value, permanent);
  });

  battle.on(BattleEvents.UnitConsumeEnergy, ValuePriority.Initial, (event) => {
    // Rounded up so small amounts still run out
    event.value = Math.ceil(event.source.getEnergy(event.energy, false) * CONSUMABLE_STACKS);
  });

  battle.on(BattleEvents.UnitConsumeEnergy, ValuePriority.Exact, (event) => {
    event.source.removeEnergy(event.energy, event.value, false);
  });

  battle.on(BattleEvents.UnitTriggerEnergy, EventPriority.Post, (event) => {
    if (!(event.flags & TriggerEnergyFlags.NoConsume)) {
      event.source.consumeEnergy(event.energy);
    }
  });

  // Time since each energy last triggered naturally, per unit
  const clocks = new Map<Unit, UnitEnergy>();

  battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
    if (event.source.alive) {
      clocks.set(event.source, createEnergyField());
    }
  });

  battle.on(BattleEvents.UnitFaints, EventPriority.Post, (event) => {
    clocks.delete(event.source);
  });

  battle.on(BattleEvents.TeamRemoveUnit, EventPriority.Post, (event) => {
    clocks.delete(event.unit);
  });

  battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
    for (const [unit, elapsed] of clocks) {
      for (const energy of ENERGIES) {
        // A trigger may knock the unit out mid-loop
        if (!unit.alive) {
          break;
        }
        const period = unit.checkEnergyPeriod(energy);
        if (period > 0) {
          elapsed[energy] += event.duration;
          if (elapsed[energy] >= period) {
            elapsed[energy] -= period;
            unit.triggerEnergy(energy, TriggerEnergyFlags.Natural);
          }
        }
      }
    }
  });
}
