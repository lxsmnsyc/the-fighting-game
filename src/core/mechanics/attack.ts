import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEventType,
  RoundEventType,
  Stat,
  StatPriority,
} from '../types';

export function setupAttackMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Attack mechanics.');
    round.on(RoundEventType.SetStat, StatPriority.Exact, event => {
      if (event.type === Stat.Attack) {
        log(`${event.source.owner.name}'s Attack changed to ${event.amount}`);
        event.source.stats[Stat.Attack] = Math.max(0, event.amount);
      }
    });

    round.on(RoundEventType.AddStat, StatPriority.Exact, event => {
      if (event.type === Stat.Attack) {
        log(`${event.source.owner.name} gained ${event.amount} of Attack`);
        round.setStat(
          Stat.Attack,
          event.source,
          event.source.stats[Stat.Attack] + event.amount,
        );
      }
    });

    round.on(RoundEventType.RemoveStat, StatPriority.Exact, event => {
      if (event.type === Stat.Attack) {
        log(`${event.source.owner.name} lost ${event.amount} of Attack`);
        round.setStat(
          Stat.Attack,
          event.source,
          event.source.stats[Stat.Attack] - event.amount,
        );
      }
    });
  });
}
