import { EventType, type Game } from '../game';
import { log } from '../log';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupHealthMechanics(game: Game): void {
  log('Setting up Health mechanics.');
  game.on(EventType.AddHealth, BuffPriority.Exact, event => {
    log(`${event.source.name} gained ${event.amount} of Health`);
    event.source.health = Math.min(
      event.source.maxHealth,
      event.source.health + event.amount,
    );
  });

  game.on(EventType.RemoveHealth, DebuffPriority.Exact, event => {
    const deduction = Math.min(event.target.health, event.amount);
    log(`${event.target.name} lost ${deduction} of Health`);
    event.target.health -= deduction;
  });

  game.on(EventType.RemoveHealth, DebuffPriority.Post, event => {
    if (event.target.health === 0) {
      log(`${event.target.name} died.`);
      game.endGame(event.source, event.target);
    }
  });
}
