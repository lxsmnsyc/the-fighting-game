import { EventType, type Game } from '../game';

export function setupDamageMechanics(game: Game): void {
  // Core damage event handler
  game.on(EventType.Damage, event => {
    if (event.priority === 3) {
      game.triggerDebuff(
        EventType.RemoveHealth,
        event.source,
        event.target,
        event.amount,
      );
    }
  });
}
