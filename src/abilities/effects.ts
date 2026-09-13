import { DEFAULT_CRITICAL_MULTIPLIER } from '../battle/constants';
import { BattleEvents, type UnitAbilityEvent, type UnitDamageEvent } from '../battle/events';
import { DamageFlags } from '../battle/flags';
import { isMissedDamage } from '../battle/mechanics/damage';
import { DamagePriority } from '../battle/types';
import type Battle from '../battle/core';
import type Unit from '../battle/unit';
import { type EventListenerLifecycle, EventPriority } from '../core/event-emitter';
import type { Lifecycle } from '../core/lifecycle';
import type { AbilityContext } from '../game/ability';

/**
 * Runs `effect` against the unit's enemy whenever the ability triggers.
 * Nothing happens when there is no enemy left.
 */
export function onTriggerAbility(
  { battle, unit, ability }: AbilityContext,
  effect: (enemy: Unit) => void,
): EventListenerLifecycle<UnitAbilityEvent> {
  return battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Exact, (event) => {
    if (event.ability !== ability) {
      return;
    }
    const enemy = unit.checkEnemy();
    if (enemy) {
      effect(enemy);
    }
  });
}

export interface DamageReport {
  damage: number;
  critical: boolean;
}

/**
 * The damage `unit` deals while `action` runs, including anything the
 * action sets off. Missed damage does not count.
 */
export function measureDamage(battle: Battle, unit: Unit, action: () => void): DamageReport {
  const report: DamageReport = { damage: 0, critical: false };
  const listener = (event: UnitDamageEvent): void => {
    if (event.source === unit && !isMissedDamage(event.flags)) {
      report.damage += event.value;
      report.critical = report.critical || (event.flags & DamageFlags.Critical) !== 0;
    }
  };

  battle.on(BattleEvents.UnitDamage, DamagePriority.Post, listener);
  try {
    action();
  } finally {
    battle.off(BattleEvents.UnitDamage, DamagePriority.Post, listener);
  }
  return report;
}

/**
 * Runs `action`, and makes the first attack `unit` deals in it a
 * critical hit. It can still be dodged.
 */
export function withCertainCritical(battle: Battle, unit: Unit, action: () => void): void {
  let used = false;
  // Runs after the critical mechanic's own roll, and only fills in a miss
  const listener = (event: UnitDamageEvent): void => {
    if (
      used ||
      event.source !== unit ||
      (event.flags & DamageFlags.Attack) === 0 ||
      isMissedDamage(event.flags)
    ) {
      return;
    }
    used = true;
    if ((event.flags & DamageFlags.Critical) === 0) {
      unit.critical(event, DEFAULT_CRITICAL_MULTIPLIER);
    }
  };

  battle.on(BattleEvents.UnitDamage, DamagePriority.Critical, listener);
  try {
    action();
  } finally {
    battle.off(BattleEvents.UnitDamage, DamagePriority.Critical, listener);
  }
}

/**
 * A span of battle time that an ability opens, counted on ticks.
 */
export interface AbilityWindow extends Lifecycle {
  /**
   * Opens the window, or restarts it if it is already open.
   */
  open(): void;
  isOpen(): boolean;
}

/**
 * `onClose` runs when an open window runs out.
 */
export function createWindow(
  battle: Battle,
  duration: number,
  onClose?: () => void,
): AbilityWindow {
  let remaining = 0;

  // Only runs while the window is open
  const timer = battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
    remaining -= event.duration;
    if (remaining <= 0) {
      remaining = 0;
      timer.stop();
      onClose?.();
    }
  });
  timer.stop();

  return {
    open(): void {
      remaining = duration;
      timer.start();
    },
    isOpen(): boolean {
      return remaining > 0;
    },
    start(): void {
      if (remaining > 0) {
        timer.start();
      }
    },
    stop(): void {
      timer.stop();
    },
  };
}
