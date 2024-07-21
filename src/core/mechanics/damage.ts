import { DamageFlags } from '../damage-flags';
import { EventType, type Game, Stat } from '../game';
import { log } from '../log';
import { DamagePriority } from '../priorities';

export function setupDamageMechanics(game: Game): void {
  log('Setting up Damage mechanics.');
  game.on(EventType.Damage, DamagePriority.Exact, event => {
    if (!(event.flag & DamageFlags.Missed)) {
      log(
        `${event.source.name} dealt ${event.amount} damage to ${event.target.name}`,
      );
      game.removeStat(Stat.Health, event.target, event.amount);
    }
  });
}
