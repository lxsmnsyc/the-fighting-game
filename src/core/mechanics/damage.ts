import { EventType, type Game } from '../game';
import { log } from '../log';
import { DamagePriority } from '../priorities';

export function setupDamageMechanics(game: Game): void {
  log('Setting up Damage mechanics.');
  game.on(EventType.Damage, DamagePriority.Exact, event => {
    if (!event.flags.missed) {
      log(
        `${event.source.name} dealt ${event.amount} damage to ${event.target.name}`,
      );
      game.triggerDebuff(
        EventType.RemoveHealth,
        event.source,
        event.target,
        event.amount,
      );
    }
  });
}
