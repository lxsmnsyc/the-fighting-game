import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupSlowMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Slow mechanics.');

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Slow) {
        const consumable = event.source.getStacks(Stack.Slow, false);
        round.removeStack(
          Stack.Slow,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Slow) {
        log(`${event.source.owner.name}'s Slow changed to ${event.amount}`);
        event.source.setStacks(Stack.Slow, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type !== Stack.Slow) {
        return;
      }
      if (event.permanent) {
        round.setStack(
          Stack.Slow,
          event.source,
          event.source.getStacks(Stack.Slow, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;

      if (event.source.getStacks(Stack.Speed, false) > 0) {
        /**
         * Counter Speed by removing stacks from it
         */
        round.removeStack(Stack.Speed, event.source, amount, false);

        amount = -(event.source.getStacks(Stack.Speed, false) - event.amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} stacks of Slow`);
        round.setStack(
          Stack.Slow,
          event.source,
          event.source.getStacks(Stack.Slow, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Slow) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Slow`);
        round.setStack(
          Stack.Slow,
          event.source,
          event.source.getStacks(Stack.Slow, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
