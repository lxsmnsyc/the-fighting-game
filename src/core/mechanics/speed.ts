import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
} from '../types';

export function setupSpeedMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Speed mechanics.');

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Speed) {
        log(`${event.source.owner.name}'s Speed changed to ${event.amount}`);
        event.source.stacks[Stack.Speed] = event.amount;
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Speed) {
        /**
         * Counter Slow by removing stacks from it
         */
        if (event.source.stacks[Stack.Slow] > 0) {
          const diff = event.source.stacks[Stack.Slow] - event.amount;
          round.removeStack(Stack.Slow, event.source, event.amount);

          if (diff < 0) {
            log(`${event.source.owner.name} gained ${-diff} stacks of Speed`);
            round.setStack(
              Stack.Speed,
              event.source,
              event.source.stacks[Stack.Speed] - diff,
            );
          }
        } else {
          log(
            `${event.source.owner.name} gained ${event.amount} stacks of Speed`,
          );
          round.setStack(
            Stack.Speed,
            event.source,
            event.source.stacks[Stack.Speed] + event.amount,
          );
        }
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Speed) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Speed`);
        round.setStack(
          Stack.Speed,
          event.source,
          event.source.stacks[Stack.Speed] - event.amount,
        );
      }
    });
  });
}
