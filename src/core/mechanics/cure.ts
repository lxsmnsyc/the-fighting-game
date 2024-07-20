import { EventType, type Game, Stack } from '../game';
import { log } from '../log';
import { StackPriority } from '../priorities';

export function setupCureMechanics(game: Game): void {
  log('Setting up Cure mechanics.');
  game.on(EventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      log(`${event.source.name}'s Cure changed to ${event.amount}`);
      event.source.stacks[Stack.Cure] = event.amount;
    }
  });

  game.on(EventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      log(`${event.source.name} gained ${event.amount} stacks of Cure`);
      game.setStack(
        Stack.Cure,
        event.source,
        event.source.stacks[Stack.Cure] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      log(`${event.target.name} lost ${event.amount} stacks of Cure`);
      game.setStack(
        Stack.Cure,
        event.target,
        event.target.stacks[Stack.Cure] - event.amount,
      );
    }
  });
}
