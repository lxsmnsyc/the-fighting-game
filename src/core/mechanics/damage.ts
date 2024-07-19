import { EventType, type Game } from '../game';

export function setupDamageMechanics(game: Game): void {
  game.on(EventType.Damage, event => {
    // Event priority 3 (exact)
    if (event.priority === 3 && !event.flags.dodged) {
      game.triggerDebuff(
        EventType.RemoveHealth,
        event.source,
        event.target,
        event.amount,
      );
    }
  });
}
