import { EventType, type Game } from '../game';
import { log } from '../log';
import { DebuffPriority } from '../priorities';

export function setupPoisonMechanics(game: Game): void {
  log('Setting up Poison mechanics.');
  game.on(EventType.AddPoison, DebuffPriority.Exact, event => {
    log(`${event.target.name} gained ${event.amount} stacks of Poison`);
    event.target.poisonStacks += event.amount;
  });

  game.on(EventType.RemovePoison, DebuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.source.poisonStacks);
    log(`${event.source.name} lost ${event.amount} stacks of Poison`);
    event.source.poisonStacks -= event.amount;
  });
}
