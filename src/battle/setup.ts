import Battle from './core';
import setupAbilityMechanics from './mechanics/ability';
import setupArmorMechanics from './mechanics/armor';
import setupAttackMechanics from './mechanics/attack';
import setupCardMechanics from './mechanics/card';
import setupCorrosionMechanics from './mechanics/corrosion';
import setupCriticalMechanics from './mechanics/critical';
import setupDamageMechanics from './mechanics/damage';
import setupDebugMechanics from './mechanics/debug';
import setupDodgeMechanics from './mechanics/dodge';
import setupEnergyMechanics from './mechanics/energy';
import setupFieldMechanics from './mechanics/field';
import setupHealingMechanics from './mechanics/healing';
import setupMagicMechanics from './mechanics/magic';
import setupOutcomeMechanics from './mechanics/outcome';
import setupPoisonMechanics from './mechanics/poison';
import setupRealtimeMechanics from './mechanics/realtime';
import setupSlowMechanics from './mechanics/slow';
import setupSpeedMechanics from './mechanics/speed';
import setupTargetMechanics from './mechanics/target';
import setupUnitMechanics from './mechanics/unit';

export interface BattleOptions {
  /**
   * Drive the battle from animation frames. Leave it off for tests and
   * replays, which call `battle.tick` themselves.
   */
  realtime?: boolean;
  /**
   * Log what happens to the console.
   */
  debug?: boolean;
  /**
   * How long the battle may run, in milliseconds, before it ends in a
   * draw. Zero or unset means no limit.
   */
  timeLimit?: number;
  /**
   * Battle time to count down before the fight begins, in
   * milliseconds. Zero or unset begins it with `start`.
   */
  countdown?: number;
}

/**
 * A battle with every mechanic wired.
 */
export default function createBattle(seed: string, options?: BattleOptions): Battle {
  const battle = new Battle(seed);

  setupFieldMechanics(battle);
  setupUnitMechanics(battle);
  setupEnergyMechanics(battle);
  setupTargetMechanics(battle);
  setupDamageMechanics(battle);

  // Offensive energy
  setupAttackMechanics(battle);
  setupMagicMechanics(battle);
  setupPoisonMechanics(battle);

  // Supportive energy
  setupArmorMechanics(battle);
  setupCorrosionMechanics(battle);
  setupDodgeMechanics(battle);
  setupCriticalMechanics(battle);
  setupSpeedMechanics(battle);
  setupSlowMechanics(battle);
  setupHealingMechanics(battle);

  setupCardMechanics(battle);
  setupAbilityMechanics(battle);

  if (options?.debug === true) {
    setupDebugMechanics(battle);
  }

  // Last, so it sees each tick after everything else resolved
  battle.timeLimit = options?.timeLimit ?? 0;
  battle.countdown = options?.countdown ?? 0;
  setupOutcomeMechanics(battle);

  if (options?.realtime === true) {
    setupRealtimeMechanics(battle);
  }

  return battle;
}
