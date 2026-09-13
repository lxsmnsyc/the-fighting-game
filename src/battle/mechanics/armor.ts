import type Battle from '../core';
import { BattleEvents } from '../events';
import { DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamagePriority, Energy, ValuePriority } from '../types';
import { isDirectDamage, isMissedDamage } from './damage';

export default function setupArmorMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitDamage, DamagePriority.Armor, (event) => {
    if (
      isMissedDamage(event.flags) ||
      event.flags & DamageFlags.Armor ||
      isDirectDamage(event.type)
    ) {
      return;
    }
    const armor = event.target.getTotalEnergy(Energy.Armor);
    if (armor > 0) {
      event.target.armor(event, armor);
    }
  });

  battle.on(BattleEvents.UnitArmor, ValuePriority.Exact, (event) => {
    if (!(event.flags & TriggerEnergyFlags.Failed)) {
      event.parent.value = Math.max(0, event.parent.value - event.value);
      event.parent.flags |= DamageFlags.Armor;
    }
    if (!(event.flags & TriggerEnergyFlags.NoConsume)) {
      event.source.consumeEnergy(Energy.Armor);
    }
  });
}
