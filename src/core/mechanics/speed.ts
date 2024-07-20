import { EventType, type Game } from '../game';
import { log } from '../log';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupSpeedMechanics(game: Game): void {
  log('Setting up Speed mechanics.');
  game.on(EventType.AddSpeed, BuffPriority.Exact, event => {
    log(`${event.source.name} gained ${event.amount} stacks of Speed`);
    event.source.stacks.speed += event.amount;
  });

  game.on(EventType.RemoveSpeed, DebuffPriority.Exact, event => {
    log(`${event.target.name} lost ${event.amount} stacks of Speed`);
    event.target.stacks.speed -= event.amount;
  });
}
