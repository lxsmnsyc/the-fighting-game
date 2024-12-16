import { log } from './log';
import { setupAbilityMechanics } from './mechanics/ability';
import { setupArmorMechanics } from './mechanics/armor';
import { setupAttackMechanics } from './mechanics/attack';
import { setupCriticalMechanics } from './mechanics/critical';
import { setupCureMechanics } from './mechanics/cure';
import { setupDamageMechanics } from './mechanics/damage';
import { setupEvasionMechanics } from './mechanics/evasion';
import { setupHealthMechanics } from './mechanics/health';
import { setupLuckMechanics } from './mechanics/luck';
import { setupMagicMechanics } from './mechanics/magic';
import { setupManaMechanics } from './mechanics/mana';
import { setupSpeedMechanics } from './mechanics/speed';
import { setupTickMechanics } from './mechanics/tick';
import { EventPriority } from './priorities';

export function setupGame(game: Game): void {
  game.on(RoundEventType.Prepare, EventPriority.Exact, () => {
    log('Preparing game.');
    game.setup();
  });

  game.on(RoundEventType.Setup, EventPriority.Exact, () => {
    log('Setting up game.');
    setupAbilityMechanics(game);
    // Health and Mana
    setupHealthMechanics(game);
    setupManaMechanics(game);
    // Other stats
    setupAttackMechanics(game);
    setupMagicMechanics(game);
    // Stacks
    setupLuckMechanics(game);
    setupSpeedMechanics(game);
    setupCureMechanics(game);
    setupEvasionMechanics(game);
    setupCriticalMechanics(game);
    setupArmorMechanics(game);
    // Damage
    setupDamageMechanics(game);

    // Game Tick
    setupTickMechanics(game);
  });
}
