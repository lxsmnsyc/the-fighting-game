import { EventPriority } from '../../core/event-emitter';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamageType, Energy } from '../types';

// Magic has no period of its own: it only takes effect when triggered
export default function setupMagicMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitTriggerEnergy, EventPriority.Exact, (event) => {
    if (event.energy !== Energy.Magic || event.flags & TriggerEnergyFlags.Failed) {
      return;
    }
    const value = event.source.getTotalEnergy(Energy.Magic);
    const target = event.source.checkEnemy();
    if (value > 0 && target) {
      event.source.dealDamage(target, DamageType.Magical, value, DamageFlags.Tick);
    }
  });
}
