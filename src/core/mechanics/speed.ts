import { EventType, type Game, Stack } from '../game';
import { log } from '../log';
import { StackPriority } from '../priorities';

export function setupSpeedMechanics(game: Game): void {
  log('Setting up Speed mechanics.');
  game.on(EventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Speed) {
      log(`${event.source.name}'s Speed changed to ${event.amount}`);
      event.source.stacks[Stack.Speed] = event.amount;
    }
  });

  game.on(EventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Speed) {
      log(`${event.source.name} gained ${event.amount} stacks of Speed`);
      game.setStack(
        Stack.Speed,
        event.source,
        event.source.stacks[Stack.Speed] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Speed) {
      log(`${event.source.name} lost ${event.amount} stacks of Speed`);
      game.setStack(
        Stack.Speed,
        event.source,
        event.source.stacks[Stack.Speed] - event.amount,
      );
    }
  });
}
