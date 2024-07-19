import { EventType, type Game } from './game';
import { log } from './log';
import { setupAbilityMechanics } from './mechanics/ability';
import { setupEvasionMechanics } from './mechanics/evasion';
import { setupArmorMechanics } from './mechanics/armor';
import { setupCriticalMechanics } from './mechanics/critical';
import { setupDamageMechanics } from './mechanics/damage';
import { setupHealthMechanics } from './mechanics/health';
import { setupManaMechanics } from './mechanics/mana';
import { setupPoisonMechanics } from './mechanics/poison';
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
    // Damage
    setupDamageMechanics(game);
    setupEvasionMechanics(game);
    setupCriticalMechanics(game);
    setupArmorMechanics(game);
    // Speed and Slow
    setupSpeedMechanics(game);
    // Poison
    setupPoisonMechanics(game);

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
