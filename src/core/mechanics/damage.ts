import { EventType, type Game } from '../game';
import { DamagePriority } from '../priorities';

export function setupDamageMechanics(game: Game): void {
  game.on(EventType.Damage, DamagePriority.Exact, event => {
    if (!event.flags.dodged) {
      game.triggerDebuff(
        EventType.RemoveHealth,
        event.source,
        event.target,
        event.amount,
      );
    }
  });
}
