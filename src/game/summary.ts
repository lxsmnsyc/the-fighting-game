import type Battle from '../battle/core';
import { BattleEvents } from '../battle/events';
import { TriggerEnergyFlags } from '../battle/flags';
import { isMissedDamage } from '../battle/mechanics/damage';
import { DamagePriority, Stat, ValuePriority } from '../battle/types';
import type Unit from '../battle/unit';
import { EventPriority } from '../core/event-emitter';
import type { Player } from './player';
import type { BattleResult } from './types';

/**
 * What one side did in a battle.
 */
export interface BattleStats {
  damageDealt: number;
  damageTaken: number;
  /**
   * Health actually restored, so overhealing does not count.
   */
  healing: number;
  attacks: number;
  criticalHits: number;
  dodges: number;
  cardTriggers: number;
  abilityTriggers: number;
}

export interface BattleSides {
  player: BattleStats;
  enemy: BattleStats;
}

export interface BattleSummary extends BattleSides {
  result: BattleResult;
  /**
   * Battle time the fight lasted, in milliseconds.
   */
  duration: number;
  gold: number;
  livesLost: number;
}

export function createBattleStats(): BattleStats {
  return {
    damageDealt: 0,
    damageTaken: 0,
    healing: 0,
    attacks: 0,
    criticalHits: 0,
    dodges: 0,
    cardTriggers: 0,
    abilityTriggers: 0,
  };
}

/**
 * Counts what each side does in `battle` from here on. Units of `player`
 * are one side, and every other unit is the enemy.
 */
export function trackBattleStats(battle: Battle, player: Player): BattleSides {
  const sides: BattleSides = { player: createBattleStats(), enemy: createBattleStats() };
  const getSide = (unit: Unit): BattleStats =>
    unit.team.player === player ? sides.player : sides.enemy;
  const getOtherSide = (unit: Unit): BattleStats =>
    unit.team.player === player ? sides.enemy : sides.player;
  const healthBefore = new WeakMap<object, number>();

  // Poison hurts the unit that carries it, so damage is dealt by the side
  // that did not take it
  battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
    if (isMissedDamage(event.flags) || event.value <= 0) {
      return;
    }
    getSide(event.target).damageTaken += event.value;
    getOtherSide(event.target).damageDealt += event.value;
  });

  battle.on(BattleEvents.UnitHeal, ValuePriority.Pre, (event) => {
    healthBefore.set(event, event.target.stats[Stat.Health]);
  });
  battle.on(BattleEvents.UnitHeal, ValuePriority.Post, (event) => {
    const before = healthBefore.get(event) ?? event.target.stats[Stat.Health];
    getSide(event.target).healing += Math.max(0, event.target.stats[Stat.Health] - before);
  });

  battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
    getSide(event.source).attacks++;
  });

  battle.on(BattleEvents.UnitCritical, ValuePriority.Post, (event) => {
    if ((event.flags & TriggerEnergyFlags.Failed) === 0) {
      getSide(event.source).criticalHits++;
    }
  });

  battle.on(BattleEvents.UnitDodge, ValuePriority.Post, (event) => {
    if ((event.flags & TriggerEnergyFlags.Failed) === 0) {
      getSide(event.source).dodges++;
    }
  });

  battle.on(BattleEvents.UnitTriggerCard, EventPriority.Post, (event) => {
    getSide(event.source).cardTriggers++;
  });

  battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Post, (event) => {
    getSide(event.source).abilityTriggers++;
  });

  return sides;
}
