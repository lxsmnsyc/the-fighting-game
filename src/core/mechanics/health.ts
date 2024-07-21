import { EventType, type Game, Stat } from '../game';
import { log } from '../log';
import { StatPriority } from '../priorities';

export function setupHealthMechanics(game: Game): void {
  log('Setting up Health mechanics.');
  game.on(EventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.Health) {
      log(`${event.source.name}'s Health changed to ${event.amount}`);
      event.source.stats[Stat.Health] = Math.max(0, event.amount);
    }
  });

  game.on(EventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.Health) {
      log(`${event.source.name} gained ${event.amount} of Health`);

      game.setStat(
        Stat.Health,
        event.source,
        event.source.stats[Stat.Health] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.Health) {
      log(`${event.source.name} lost ${event.amount} of Health`);

      game.setStat(
        Stat.Health,
        event.source,
        event.source.stats[Stat.Health] - event.amount,
      );
    }
  });

  // Death condition
  game.on(EventType.SetStat, StatPriority.Post, event => {
    if (event.type === Stat.Health && event.source.stats[Stat.Health] === 0) {
      log(`${event.source.name} died.`);
      game.endGame(game.getOppositePlayer(event.source), event.source);
    }
  });

  log('Setting up Max Health mechanics.');
  game.on(EventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.MaxHealth) {
      log(`${event.source.name}'s MaxHealth changed to ${event.amount}`);
      event.source.stats[Stat.MaxHealth] = Math.max(1, event.amount);
    }
  });

  game.on(EventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.MaxHealth) {
      log(`${event.source.name} gained ${event.amount} of Max Health`);
      // Get the current health percentage
      const currentHealth =
        event.source.stats[Stat.Health] / event.source.stats[Stat.MaxHealth];

      game.setStat(
        Stat.MaxHealth,
        event.source,
        event.source.stats[Stat.MaxHealth] + event.amount,
      );
      // Rescale
      game.setStat(
        Stat.Health,
        event.source,
        currentHealth * event.source.stats[Stat.MaxHealth],
      );
    }
  });

  game.on(EventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.MaxHealth) {
      log(`${event.source.name} lost ${event.amount} of Max Health`);
      // Get the current health percentage
      const currentHealth =
        event.source.stats[Stat.Health] / event.source.stats[Stat.MaxHealth];
      game.setStat(
        Stat.MaxHealth,
        event.source,
        event.source.stats[Stat.MaxHealth] - event.amount,
      );
      // Rescale
      game.setStat(
        Stat.Health,
        event.source,
        currentHealth * event.source.stats[Stat.MaxHealth],
      );
    }
  });
}
