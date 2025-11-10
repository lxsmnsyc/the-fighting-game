import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEvents,
  RoundEvents,
  Stat,
  ValuePriority,
} from '../types';

export function setupHealthMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Health mechanics.');
    round.on(RoundEvents.SetStat, ValuePriority.Exact, event => {
      if (event.type === Stat.Health) {
        log(`${event.source.owner.name}'s Health changed to ${event.amount}`);
        event.source.stats[Stat.Health] = Math.max(0, event.amount);
      }
    });

    round.on(RoundEvents.AddStat, ValuePriority.Exact, event => {
      if (event.type === Stat.Health) {
        log(`${event.source.owner.name} gained ${event.amount} of Health`);

        round.setStat(
          Stat.Health,
          event.source,
          event.source.stats[Stat.Health] + event.amount,
        );
      }
    });

    round.on(RoundEvents.RemoveStat, ValuePriority.Exact, event => {
      if (event.type === Stat.Health) {
        log(`${event.source.owner.name} lost ${event.amount} of Health`);

        round.setStat(
          Stat.Health,
          event.source,
          event.source.stats[Stat.Health] - event.amount,
        );
      }
    });

    // Death condition
    round.on(RoundEvents.SetStat, ValuePriority.Post, event => {
      if (event.type === Stat.Health && event.source.stats[Stat.Health] === 0) {
        log(`${event.source.owner.name} died.`);
        round.end(round.getEnemyUnit(event.source), event.source);
      }
    });

    log('Setting up Max Health mechanics.');
    round.on(RoundEvents.SetStat, ValuePriority.Exact, event => {
      if (event.type === Stat.MaxHealth) {
        // Get the current health percentage
        const currentHealth =
          event.source.stats[Stat.Health] / event.source.stats[Stat.MaxHealth];

        event.amount = Math.max(1, event.amount);
        log(
          `${event.source.owner.name}'s MaxHealth changed to ${event.amount}`,
        );
        event.source.stats[Stat.MaxHealth] = event.amount;

        // Rescale
        round.setStat(
          Stat.Health,
          event.source,
          currentHealth * event.source.stats[Stat.MaxHealth],
        );
      }
    });

    round.on(RoundEvents.AddStat, ValuePriority.Exact, event => {
      if (event.type === Stat.MaxHealth) {
        log(`${event.source.owner.name} gained ${event.amount} of Max Health`);

        round.setStat(
          Stat.MaxHealth,
          event.source,
          event.source.stats[Stat.MaxHealth] + event.amount,
        );
      }
    });

    round.on(RoundEvents.RemoveStat, ValuePriority.Exact, event => {
      if (event.type === Stat.MaxHealth) {
        log(`${event.source.owner.name} lost ${event.amount} of Max Health`);
        round.setStat(
          Stat.MaxHealth,
          event.source,
          event.source.stats[Stat.MaxHealth] - event.amount,
        );
      }
    });
  });
}
