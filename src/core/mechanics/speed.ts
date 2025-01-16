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

export function setupSpeedMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Speed mechanics.');

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Speed) {
        const consumable = event.source.getStacks(Stack.Speed, false);
        round.removeStack(
          Stack.Speed,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Speed) {
        log(`${event.source.owner.name}'s Speed changed to ${event.amount}`);
        event.source.setStacks(Stack.Speed, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type !== Stack.Speed) {
        return;
      }
      if (event.permanent) {
        round.setStack(
          Stack.Speed,
          event.source,
          event.source.getStacks(Stack.Speed, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;

      if (event.source.getStacks(Stack.Slow, false) > 0) {
        /**
         * Counter Slow by removing stacks from it
         */
        round.removeStack(Stack.Slow, event.source, amount, false);

        amount = -(event.source.getStacks(Stack.Slow, false) - event.amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} stacks of Speed`);
        round.setStack(
          Stack.Speed,
          event.source,
          event.source.getStacks(Stack.Speed, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Speed) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Speed`);
        round.setStack(
          Stack.Speed,
          event.source,
          event.source.getStacks(Stack.Speed, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
