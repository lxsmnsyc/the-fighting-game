import { EventType, type Game } from '../game';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupHealthMechanics(game: Game): void {
  game.on(EventType.AddHealth, BuffPriority.Exact, event => {
    event.source.health = Math.min(
      event.source.maxHealth,
      event.source.health + event.amount,
    );
  });

  game.on(EventType.RemoveHealth, DebuffPriority.Exact, event => {
    event.source.health = Math.max(0, event.source.health - event.amount);
  });
}
