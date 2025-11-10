import { DamageFlags } from '../flags';
import type { Game } from '../game';
import { log } from '../log';
import {
  DamagePriority,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stat,
} from '../types';

export function isMissedDamage(flag: number): boolean {
  return !!(flag & DamageFlags.Missed && !(flag & DamageFlags.Pierce));
}

export function setupDamageMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Damage mechanics.');
    round.on(RoundEvents.Damage, DamagePriority.Exact, event => {
      if (isMissedDamage(event.flag)) {
        return;
      }
      log(
        `${event.source.owner.name} dealt ${event.amount} damage to ${event.target.owner.name}`,
      );
      round.removeStat(Stat.Health, event.target, event.amount);
    });
  });
}
