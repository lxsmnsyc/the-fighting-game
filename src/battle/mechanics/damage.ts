import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags } from '../flags';
import { DamagePriority, DamageType, Stat } from '../types';

export function isMissedDamage(flags: number): boolean {
  return (flags & DamageFlags.Missed) !== 0 && (flags & DamageFlags.Pierce) === 0;
}

/**
 * Whether the damage skips Armor and Corrosion.
 */
export function isDirectDamage(type: DamageType): boolean {
  return type === DamageType.Poison || type === DamageType.Pure || type === DamageType.HealthLoss;
}

export default function setupDamageMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitDamage, DamagePriority.Exact, (event) => {
    const { target } = event;
    if (!target.alive || isMissedDamage(event.flags)) {
      return;
    }
    let value = Math.max(0, event.value);
    if (event.flags & DamageFlags.NonLethal) {
      value = Math.min(value, Math.max(0, target.stats[Stat.Health] - 1));
    }
    target.removeStat(Stat.Health, value);
  });
}
