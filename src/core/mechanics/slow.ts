import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEventType,
  RoundEventType,
  Stack,
  StackPriority,
} from '../types';

export function setupSlowMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Slow mechanics.');

    round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Slow) {
        log(`${event.source.owner.name}'s Slow changed to ${event.amount}`);
        event.source.stacks[Stack.Slow] = event.amount;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Slow) {
        /**
         * Counter Speed by removing stacks from it
         */
        if (event.source.stacks[Stack.Speed] > 0) {
          const diff = event.source.stacks[Stack.Speed] - event.amount;
          round.removeStack(Stack.Speed, event.source, event.amount);

          if (diff < 0) {
            log(`${event.source.owner.name} gained ${-diff} stacks of Slow`);
            round.setStack(
              Stack.Slow,
              event.source,
              event.source.stacks[Stack.Slow] - diff,
            );
          }
        } else {
          log(
            `${event.source.owner.name} gained ${event.amount} stacks of Slow`,
          );
          round.setStack(
            Stack.Slow,
            event.source,
            event.source.stacks[Stack.Slow] + event.amount,
          );
        }
      }
    });

    round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Slow) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Slow`);
        round.setStack(
          Stack.Slow,
          event.source,
          event.source.stacks[Stack.Slow] - event.amount,
        );
      }
    });
  });
}
