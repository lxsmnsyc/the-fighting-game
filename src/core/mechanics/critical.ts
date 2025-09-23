import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
  TriggerStackFlags,
} from '../types';

const DEFAULT_CRITICAL_MULTIPLIER = 2;
const MIN_CRITICAL_CHANCE = 0;
const MAX_CRITICAL_CHANCE = 100;
const MAX_CRITICAL_STACKS = 1000;
const CONSUMABLE_STACKS = 0.4;

function getCriticalChance(stack: number): number {
  return lerp(
    MIN_CRITICAL_CHANCE,
    MAX_CRITICAL_CHANCE,
    Math.min(stack / MAX_CRITICAL_STACKS, 1),
  );
}

export function setupCriticalMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Critical mechanics.');

    round.on(RoundEvents.Damage, DamagePriority.Critical, event => {
      if (event.flag & (DamageFlags.Missed | DamageFlags.Critical)) {
        return;
      }
      // Check if player can crit
      if (event.type === DamageType.Attack) {
        const stacks = event.source.getTotalStacks(Stack.Critical);
        // If there's no critical stack
        if (stacks === 0) {
          return;
        }
        // Calculate critical chance
        const currentCriticalChance = getCriticalChance(stacks);
        // Push your luck
        const random = event.source.rng.random() * 100;
        if (random > currentCriticalChance) {
          return;
        }
        
        round.critical(event, DEFAULT_CRITICAL_MULTIPLIER, 0);
      }
    });

    round.on(RoundEvents.Critical, EventPriority.Exact, event => {
      if (event.flag & TriggerStackFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerStackFlags.Failed)) {
        event.parent.amount *= event.multiplier;
        log(`${event.parent.source.owner.name} triggered a critical.`);
        event.flag |= DamageFlags.Critical;
      }
      if (event.flag & TriggerStackFlags.NoConsume) {
        return;
      }
      round.consumeStack(Stack.Critical, event.parent.source);
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        const current = event.source.getStacks(Stack.Critical, false);
        round.removeStack(
          Stack.Critical,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        log(
          `${event.source.owner.name}'s Critical stacks changed to ${event.amount}`,
        );
        event.source.setStacks(Stack.Critical, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Critical`,
        );
        round.setStack(
          Stack.Critical,
          event.source,
          event.source.getStacks(Stack.Critical, event.permanent) +
            event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Critical`,
        );
        round.setStack(
          Stack.Critical,
          event.source,
          event.source.getStacks(Stack.Critical, event.permanent) -
            event.amount,
          event.permanent,
        );
      }
    });
  });
}
