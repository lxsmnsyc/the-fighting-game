import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEventType,
  RoundEventType,
  Stack,
  StackPriority,
} from '../types';

const CONSUMABLE_STACKS = 0.5;

export function setupCureMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Cure mechanics.');

    round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Cure) {
        const current = event.source.stacks[Stack.Cure];
        round.removeStack(
          Stack.Cure,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Cure) {
        const clamped = Math.max(0, event.amount);
        log(`${event.source.owner.name}'s Cure stacks changed to ${clamped}`);
        event.source.stacks[Stack.Cure] = clamped;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Cure) {
        /**
         * Counter Poison by removing stacks from it
         */
        if (event.source.stacks[Stack.Poison] > 0) {
          const diff = event.source.stacks[Stack.Poison] - event.amount;
          round.removeStack(Stack.Poison, event.source, event.amount);

          if (diff < 0) {
            log(`${event.source.owner.name} gained ${-diff} stacks of Cure`);
            round.setStack(
              Stack.Cure,
              event.source,
              event.source.stacks[Stack.Cure] - diff,
            );
          }
        } else {
          log(
            `${event.source.owner.name} gained ${event.amount} stacks of Cure`,
          );
          round.setStack(
            Stack.Cure,
            event.source,
            event.source.stacks[Stack.Cure] + event.amount,
          );
        }
      }
    });

    round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Cure) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Cure`);
        round.setStack(
          Stack.Cure,
          event.source,
          event.source.stacks[Stack.Cure] - event.amount,
        );
      }
    });
  });
}
