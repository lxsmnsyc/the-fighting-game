import { EventType, type Game, Stat } from '../game';
import { log } from '../log';
import { StatPriority } from '../priorities';

export function setupManaMechanics(game: Game): void {
  log('Setting up Mana mechanics.');
  game.on(EventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.Mana) {
      log(`${event.source.name}'s Mana changed to ${event.amount}`);
      event.source.stats[Stat.Mana] = Math.max(0, event.amount);
    }
  });

  game.on(EventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.Mana) {
      log(`${event.source.name} gained ${event.amount} of Mana`);

      game.setStat(
        Stat.Mana,
        event.source,
        event.source.stats[Stat.Mana] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.Mana) {
      log(`${event.source.name} lost ${event.amount} of Mana`);

      game.setStat(
        Stat.Mana,
        event.source,
        event.source.stats[Stat.Mana] - event.amount,
      );
    }
  });

  log('Setting up Max Mana mechanics.');
  game.on(EventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.MaxMana) {
      log(`${event.source.name}'s MaxMana changed to ${event.amount}`);
      event.source.stats[Stat.MaxMana] = Math.max(1, event.amount);
    }
  });

  game.on(EventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.MaxMana) {
      log(`${event.source.name} gained ${event.amount} of Max Mana`);
      // Get the current health percentage
      const currentMana =
        event.source.stats[Stat.Mana] / event.source.stats[Stat.MaxMana];

      game.setStat(
        Stat.MaxMana,
        event.source,
        event.source.stats[Stat.MaxMana] + event.amount,
      );
      // Rescale
      game.setStat(
        Stat.Mana,
        event.source,
        currentMana * event.source.stats[Stat.MaxMana],
      );
    }
  });

  game.on(EventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.MaxMana) {
      log(`${event.source.name} lost ${event.amount} of Max Mana`);
      // Get the current health percentage
      const currentMana =
        event.source.stats[Stat.Mana] / event.source.stats[Stat.MaxMana];
      game.setStat(
        Stat.MaxMana,
        event.source,
        event.source.stats[Stat.MaxMana] - event.amount,
      );
      // Rescale
      game.setStat(
        Stat.Mana,
        event.source,
        currentMana * event.source.stats[Stat.MaxMana],
      );
    }
  });
}
