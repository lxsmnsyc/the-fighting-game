import { EventPriority } from '../../core/event-emitter';
import { NATURAL_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamageType, Energy, ValuePriority } from '../types';

export default function setupPoisonMechanics(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy === Energy.Poison) {
      event.duration = NATURAL_PERIOD;
    }
  });

  // Poison hurts the unit that carries it
  battle.on(BattleEvents.UnitTriggerEnergy, EventPriority.Exact, (event) => {
    if (event.energy !== Energy.Poison || event.flags & TriggerEnergyFlags.Failed) {
      return;
    }
    let flags = DamageFlags.Tick;
    if (event.flags & TriggerEnergyFlags.Natural) {
      flags |= DamageFlags.Natural;
    }
    event.source.dealDamage(
      event.source,
      DamageType.Poison,
      event.source.getTotalEnergy(Energy.Poison),
      flags,
    );
  });
}
