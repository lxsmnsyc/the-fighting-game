import { type Game, RoundEventType, Stat } from '../game';
import { log } from '../log';
import { StatPriority } from '../priorities';

export function setupAttackMechanics(game: Game): void {
  log('Setting up Attack mechanics.');
  game.on(RoundEventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.Attack) {
      log(`${event.source.name}'s Attack changed to ${event.amount}`);
      event.source.stats[Stat.Attack] = Math.max(0, event.amount);
    }
  });

  game.on(RoundEventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.Attack) {
      log(`${event.source.name} gained ${event.amount} of Attack`);
      game.setStat(
        Stat.Attack,
        event.source,
        event.source.stats[Stat.Attack] + event.amount,
      );
    }
  });

  game.on(RoundEventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.Attack) {
      log(`${event.source.name} lost ${event.amount} of Attack`);
      game.setStat(
        Stat.Attack,
        event.source,
        event.source.stats[Stat.Attack] - event.amount,
      );
    }
  });
}
