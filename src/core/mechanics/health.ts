import { EventType, type Game } from '../game';

export function setupHealthMechanics(game: Game): void {
  game.on(EventType.AddHealth, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      event.source.health = Math.min(
        event.source.maxHealth,
        event.source.health + event.amount,
      );
    }
  });

  game.on(EventType.RemoveHealth, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      event.source.health = Math.max(0, event.source.health - event.amount);
    }
  });
}
