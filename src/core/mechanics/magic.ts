import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEventType,
  RoundEventType,
  Stat,
  StatPriority,
} from '../types';

export function setupMagicMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Magic mechanics.');
    round.on(RoundEventType.SetStat, StatPriority.Exact, event => {
      if (event.type === Stat.Magic) {
        log(`${event.source.owner.name}'s Magic changed to ${event.amount}`);
        event.source.stats[Stat.Magic] = Math.max(0, event.amount);
      }
    });

    round.on(RoundEventType.AddStat, StatPriority.Exact, event => {
      if (event.type === Stat.Magic) {
        log(`${event.source.owner.name} gained ${event.amount} of Magic`);
        round.setStat(
          Stat.Magic,
          event.source,
          event.source.stats[Stat.Magic] + event.amount,
        );
      }
    });

    round.on(RoundEventType.RemoveStat, StatPriority.Exact, event => {
      if (event.type === Stat.Magic) {
        log(`${event.source.owner.name} lost ${event.amount} of Magic`);
        round.setStat(
          Stat.Magic,
          event.source,
          event.source.stats[Stat.Magic] - event.amount,
        );
      }
    });
  });
}
