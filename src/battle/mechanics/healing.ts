import { EventPriority } from '../../core/event-emitter';
import { NATURAL_PERIOD } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { HealFlags, TriggerEnergyFlags } from '../flags';
import { Energy, Stat, ValuePriority } from '../types';

export default function setupHealingMechanics(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy === Energy.Healing) {
      event.duration = NATURAL_PERIOD;
    }
  });

  battle.on(BattleEvents.UnitTriggerEnergy, EventPriority.Exact, (event) => {
    if (event.energy !== Energy.Healing || event.flags & TriggerEnergyFlags.Failed) {
      return;
    }
    let flags = HealFlags.Tick;
    if (event.flags & TriggerEnergyFlags.Natural) {
      flags |= HealFlags.Natural;
    }
    event.source.heal(event.source, event.source.getTotalEnergy(Energy.Healing), flags);
  });

  battle.on(BattleEvents.UnitHeal, ValuePriority.Exact, (event) => {
    if (event.target.alive) {
      event.target.addStat(Stat.Health, event.value);
    }
  });
}
