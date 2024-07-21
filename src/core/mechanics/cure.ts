import { DamageType, EventType, type Game, Stack } from '../game';
import { log } from '../log';
import { EventPriority, StackPriority } from '../priorities';

const CONSUMABLE_CURE_STACKS = 0.5;

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
      log(`${event.source.name} lost ${event.amount} stacks of Cure`);
      game.setStack(
        Stack.Cure,
        event.source,
        event.source.stacks[Stack.Cure] - event.amount,
      );
    }
  });

  game.on(EventType.CureTick, EventPriority.Exact, event => {
    if (event.source.stacks[Stack.Cure] !== 0) {
      const consumable =
        (event.source.stacks[Stack.Cure] * CONSUMABLE_CURE_STACKS) | 0;
      game.removeStack(Stack.Cure, event.source, consumable);
      if (consumable < 0) {
        game.dealDamage(
          DamageType.Poison,
          game.getOppositePlayer(event.source),
          event.source,
          consumable,
          {
            critical: false,
            missed: false,
          },
        );
      }
    }
  });
}
