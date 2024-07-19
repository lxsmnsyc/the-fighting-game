import { EventType, type Game } from '../game';
import { DebuffPriority } from '../priorities';

export function setupPoisonMechanics(game: Game): void {
  game.on(EventType.AddPoison, DebuffPriority.Exact, event => {
    event.target.poisonStacks += event.amount;
  });

  game.on(EventType.RemovePoison, DebuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.source.poisonStacks);
    event.source.poisonStacks -= event.amount;
  });
}
