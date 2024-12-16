import { DamageType } from '../damage';
import { type Game, RoundEventType, Stack } from '../game';
import { log } from '../log';
import { StackPriority } from '../priorities';

const CONSUMABLE_STACKS = 0.5;

export function setupCureMechanics(game: Game): void {
  log('Setting up Cure mechanics.');
  game.on(RoundEventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      log(`${event.source.name}'s Cure changed to ${event.amount}`);
      event.source.stacks[Stack.Cure] = event.amount;
    }
  });

  game.on(RoundEventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      log(`${event.source.name} gained ${event.amount} stacks of Cure`);
      game.setStack(
        Stack.Cure,
        event.source,
        event.source.stacks[Stack.Cure] + event.amount,
      );
    }
  });

  game.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      log(`${event.source.name} lost ${event.amount} stacks of Cure`);
      game.setStack(
        Stack.Cure,
        event.source,
        event.source.stacks[Stack.Cure] - event.amount,
      );
    }
  });

  game.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
    if (event.type === Stack.Cure) {
      const stacks = event.source.stacks[Stack.Cure];
      if (stacks !== 0) {
        game.removeStack(
          Stack.Cure,
          event.source,
          Math.abs(stacks) === 1 ? stacks : stacks * CONSUMABLE_STACKS,
        );
        if (stacks < 0) {
          game.dealDamage(
            DamageType.Poison,
            game.getOppositePlayer(event.source),
            event.source,
            -stacks,
            0,
          );
        }
      }
    }
  });
}
