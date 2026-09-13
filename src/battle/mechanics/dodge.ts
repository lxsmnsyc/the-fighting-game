import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamagePriority, Energy, ValuePriority } from '../types';
import { isMissedDamage } from './damage';

// Energy at which every attack is dodged
const MAX_DODGE_STACKS = 1000;

export default function setupDodgeMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitDamage, DamagePriority.Dodge, (event) => {
    if (
      isMissedDamage(event.flags) ||
      !(event.flags & DamageFlags.Attack) ||
      event.flags & DamageFlags.Pierce
    ) {
      return;
    }
    const energy = event.target.getTotalEnergy(Energy.Dodge);
    if (energy <= 0) {
      return;
    }
    const chance = Math.min(energy / MAX_DODGE_STACKS, 1);
    if (event.target.rng.random() < chance) {
      event.target.dodge(event);
    }
  });

  battle.on(BattleEvents.UnitDodge, ValuePriority.Exact, (event) => {
    if (!(event.flags & TriggerEnergyFlags.Failed)) {
      event.parent.flags |= DamageFlags.Missed;
    }
    if (!(event.flags & TriggerEnergyFlags.NoConsume)) {
      event.source.consumeEnergy(Energy.Dodge);
    }
  });
}
