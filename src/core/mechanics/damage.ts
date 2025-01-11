import type { Game } from '../game';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  EventPriority,
  GameEventType,
  RoundEventType,
  Stat,
} from '../types';

export function setupDamageMechanics(game: Game): void {
  game.on(GameEventType.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Damage mechanics.');
    round.on(RoundEventType.Damage, DamagePriority.Exact, event => {
      if (!(event.flag & DamageFlags.Missed)) {
        log(
          `${event.source.owner.name} dealt ${event.amount} damage to ${event.target.owner.name}`,
        );
        round.removeStat(Stat.Health, event.target, event.amount);
      }
    });
  });
}
