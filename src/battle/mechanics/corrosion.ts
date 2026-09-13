import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamagePriority, Energy, ValuePriority } from '../types';
import { isDirectDamage, isMissedDamage } from './damage';

export default function setupCorrosionMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitDamage, DamagePriority.Corrosion, (event) => {
    if (
      isMissedDamage(event.flags) ||
      event.flags & DamageFlags.Corrosion ||
      isDirectDamage(event.type)
    ) {
      return;
    }
    const corrosion = event.target.getTotalEnergy(Energy.Corrosion);
    if (corrosion > 0) {
      event.target.corrode(event, corrosion);
    }
  });

  battle.on(BattleEvents.UnitCorrosion, ValuePriority.Exact, (event) => {
    if (!(event.flags & TriggerEnergyFlags.Failed)) {
      event.parent.value = Math.max(0, event.parent.value + event.value);
      event.parent.flags |= DamageFlags.Corrosion;
    }
    if (!(event.flags & TriggerEnergyFlags.NoConsume)) {
      event.source.consumeEnergy(Energy.Corrosion);
    }
  });
}
