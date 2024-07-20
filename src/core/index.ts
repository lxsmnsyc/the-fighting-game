import { EventType, type Game } from './game';
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
import { setupManaMechanics } from './mechanics/mana';
import { setupSpeedMechanics } from './mechanics/speed';
import { EventPriority } from './priorities';

export function setupGame(game: Game): void {
  game.on(EventType.Prepare, EventPriority.Exact, () => {
    log('Preparing game.');
    game.setup();
  });

  game.on(EventType.Setup, EventPriority.Exact, () => {
    log('Setting up game.');
    setupAbilityMechanics(game);
    // Health and Mana
    setupHealthMechanics(game);
    setupManaMechanics(game);
    // Other stats
    setupAttackMechanics(game);
    // Stacks
    setupLuckMechanics(game);
    setupSpeedMechanics(game);
    setupCureMechanics(game);
    // Damage
    setupDamageMechanics(game);
    setupEvasionMechanics(game);
    setupCriticalMechanics(game);
    setupArmorMechanics(game);

    game.playerA.load(game);
    game.playerB.load(game);

    game.start();
  });

  game.on(EventType.EndGame, EventPriority.Exact, event => {
    log(`Winner is ${event.winner.name}`);
    game.close();
  });

  game.on(EventType.Start, EventPriority.Exact, () => {
    log('Game started.');
  });
}
