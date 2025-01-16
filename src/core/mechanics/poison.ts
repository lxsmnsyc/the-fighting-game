import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
  TriggerStackFlags,
} from '../types';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupPoisonMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Poison mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      let elapsed = 0;
      let ready = true;

      round.on(RoundEvents.Tick, EventPriority.Exact, event => {
        if (!ready) {
          elapsed += event.delta;
          if (elapsed >= DEFAULT_PERIOD) {
            elapsed -= DEFAULT_PERIOD;
            ready = true;
          }
        }
        if (ready && source) {
          ready = false;
          round.consumeStack(Stack.Poison, source);
        }
      });
    });

    round.on(RoundEvents.TriggerStack, StackPriority.Exact, event => {
      if (event.type !== Stack.Poison) {
        return;
      }
      if (event.flag & TriggerStackFlags.Failed) {
        return;
      }
      const stacks = event.source.getTotalStacks(Stack.Poison);
      if (stacks > 0) {
        round.dealDamage(
          DamageType.Poison,
          round.getEnemyUnit(event.source),
          event.source,
          stacks,
          0,
        );
      }
      if (event.flag & TriggerStackFlags.Consume) {
        round.consumeStack(Stack.Poison, event.source);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        const current = event.source.getStacks(Stack.Poison, false);
        round.removeStack(
          Stack.Poison,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        log(
          `${event.source.owner.name}'s Poison stacks changed to ${event.amount}`,
        );
        event.source.setStacks(Stack.Poison, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Poison`,
        );
        round.setStack(
          Stack.Poison,
          event.source,
          event.source.getStacks(Stack.Poison, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Poison`);
        round.setStack(
          Stack.Poison,
          event.source,
          event.source.getStacks(Stack.Poison, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
