import { EventType, type Game, Stat } from '../game';
import { log } from '../log';
import { StatPriority } from '../priorities';

export function setupMagicMechanics(game: Game): void {
  log('Setting up Magic mechanics.');
  game.on(EventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.Magic) {
      log(`${event.source.name}'s Magic changed to ${event.amount}`);
      event.source.stats[Stat.Magic] = Math.max(0, event.amount);
    }
  });

  game.on(EventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.Magic) {
      log(`${event.source.name} gained ${event.amount} of Magic`);
      game.setStat(
        Stat.Magic,
        event.source,
        event.source.stats[Stat.Magic] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.Magic) {
      log(`${event.source.name} lost ${event.amount} of Magic`);
      game.setStat(
        Stat.Magic,
        event.source,
        event.source.stats[Stat.Magic] - event.amount,
      );
    }
  });
}
