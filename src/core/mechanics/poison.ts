import { EventType, type Game } from '../game';
import { log } from '../log';
import { DebuffPriority } from '../priorities';

export function setupPoisonMechanics(game: Game): void {
  log('Setting up Poison mechanics.');
  game.on(EventType.AddPoison, DebuffPriority.Exact, event => {
    log(`${event.target.name} gained ${event.amount} stacks of Poison`);
    event.target.stacks.poison += event.amount;
  });

  game.on(EventType.RemovePoison, DebuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.source.stacks.poison);
    log(`${event.source.name} lost ${event.amount} stacks of Poison`);
    event.source.stacks.poison -= event.amount;
  });
}
