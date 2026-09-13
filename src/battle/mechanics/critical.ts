import { DEFAULT_CRITICAL_MULTIPLIER } from '../constants';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamagePriority, Energy, ValuePriority } from '../types';
import { isMissedDamage } from './damage';

// Energy at which every attack is critical
const MAX_CRITICAL_STACKS = 1000;

export default function setupCriticalMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitDamage, DamagePriority.Critical, (event) => {
    if (
      isMissedDamage(event.flags) ||
      event.flags & DamageFlags.Critical ||
      !(event.flags & DamageFlags.Attack)
    ) {
      return;
    }
    const energy = event.source.getTotalEnergy(Energy.Critical);
    if (energy <= 0) {
      return;
    }
    const chance = Math.min(energy / MAX_CRITICAL_STACKS, 1);
    if (event.source.rng.random() < chance) {
      event.source.critical(event, DEFAULT_CRITICAL_MULTIPLIER);
    }
  });

  battle.on(BattleEvents.UnitCritical, ValuePriority.Exact, (event) => {
    if (!(event.flags & TriggerEnergyFlags.Failed)) {
      event.parent.value *= event.multiplier;
      event.parent.flags |= DamageFlags.Critical;
    }
    if (!(event.flags & TriggerEnergyFlags.NoConsume)) {
      event.source.consumeEnergy(Energy.Critical);
    }
  });
}
