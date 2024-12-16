import { DamageFlags } from '../damage-flags';
import { type Game, RoundEventType, Stat } from '../game';
import { log } from '../log';
import { DamagePriority } from '../priorities';

export function setupDamageMechanics(game: Game): void {
  log('Setting up Damage mechanics.');
  game.on(RoundEventType.Damage, DamagePriority.Exact, event => {
    if (!(event.flag & DamageFlags.Missed)) {
      log(
        `${event.source.name} dealt ${event.amount} damage to ${event.target.name}`,
      );
      game.removeStat(Stat.Health, event.target, event.amount);
    }
  });
}
