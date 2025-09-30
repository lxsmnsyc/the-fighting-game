import type { Game } from '../game';
import { setupArmorMechanics } from './armor';
import { setupAttackMechanics } from './attack';
import { setupCorrosionMechanics } from './corrosion';
import { setupCriticalMechanics } from './critical';
import { setupDamageMechanics } from './damage';
import { setupDodgeMechanics } from './dodge';
import { setupHealingMechanics } from './healing';
import { setupHealthMechanics } from './health';
import { setupMagicMechanics } from './magic';
import { setupPoisonMechanics } from './poison';
import { setupSlowMechanics } from './slow';
import { setupSpeedMechanics } from './speed';
import { setupTickMechanics } from './tick';

export function setupGameMechanics(game: Game): void {
  // Setup base mechanics
  setupDamageMechanics(game);
  setupTickMechanics(game);

  // Setup stats
  setupHealthMechanics(game);

  // Setup offensive energy
  setupAttackMechanics(game);
  setupMagicMechanics(game);
  setupPoisonMechanics(game);

  // Setup supportive energy
  setupArmorMechanics(game);
  setupCorrosionMechanics(game);
  setupDodgeMechanics(game);
  setupCriticalMechanics(game);
  setupSpeedMechanics(game);
  setupSlowMechanics(game);
  setupHealingMechanics(game);
}
