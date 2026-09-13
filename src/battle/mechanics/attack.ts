import { EventPriority } from '../../core/event-emitter';
import lerp from '../../core/lerp';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { AttackFlags, DamageFlags, TriggerEnergyFlags } from '../flags';
import { DamageType, Energy, ValuePriority } from '../types';

const MIN_PERIOD = 250;
const MAX_PERIOD = 5000;

const MAX_SPEED = 1000;
const MAX_SLOW = 1000;

export default function setupAttackMechanics(battle: Battle): void {
  // Speed shortens the wait between attacks and Slow lengthens it
  battle.on(BattleEvents.CheckUnitEnergyPeriod, ValuePriority.Initial, (event) => {
    if (event.energy !== Energy.Attack) {
      return;
    }
    const total = Math.max(
      -MAX_SLOW,
      Math.min(
        event.source.getTotalEnergy(Energy.Speed) - event.source.getTotalEnergy(Energy.Slow),
        MAX_SPEED,
      ),
    );
    event.duration = lerp(MAX_PERIOD, MIN_PERIOD, (MAX_SLOW + total) / (MAX_SPEED + MAX_SLOW));
  });

  battle.on(BattleEvents.UnitTriggerEnergy, EventPriority.Exact, (event) => {
    if (event.energy !== Energy.Attack || event.flags & TriggerEnergyFlags.Failed) {
      return;
    }
    const value = event.source.getTotalEnergy(Energy.Attack);
    const target = event.source.checkEnemy();
    if (value <= 0 || !target) {
      return;
    }
    let flags = AttackFlags.Tick;
    if (event.flags & TriggerEnergyFlags.Natural) {
      flags |= AttackFlags.Natural;
    }
    event.source.attack(target, value, flags);
  });

  battle.on(BattleEvents.UnitAttack, ValuePriority.Exact, (event) => {
    let flags = DamageFlags.Attack;
    if (event.flags & AttackFlags.Natural) {
      flags |= DamageFlags.Natural;
    }
    if (event.flags & AttackFlags.Tick) {
      flags |= DamageFlags.Tick;
    }
    event.source.dealDamage(event.target, DamageType.Physical, event.value, flags);
  });
}
