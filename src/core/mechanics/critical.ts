import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEventType,
  RoundEventType,
  Stack,
  StackPriority,
} from '../types';

const MIN_CRITICAL_CHANCE = 0;
const MAX_CRITICAL_CHANCE = 100;
const MAX_CRITICAL_STACKS = 750;
const CONSUMABLE_STACKS = 0.5;

function getCriticalChance(stack: number): number {
  return lerp(
    MIN_CRITICAL_CHANCE,
    MAX_CRITICAL_CHANCE,
    Math.min(stack / MAX_CRITICAL_STACKS, 1),
  );
}

export function setupCriticalMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Critical mechanics.');

    round.on(RoundEventType.Damage, DamagePriority.Critical, event => {
      if (event.flag & (DamageFlags.Missed | DamageFlags.Critical)) {
        return;
      }
      // Check if player can crit
      const stacks = event.source.stacks[Stack.Critical];
      if (event.type === DamageType.Attack && stacks !== 0) {
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
        event.amount *= 2; // TODO Adjust??
        log(`${event.source.owner.name} triggered a critical.`);
        event.flag |= DamageFlags.Critical;

        round.consumeStack(Stack.Critical, event.target);
      }
    });

    round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        const current = event.source.stacks[Stack.Critical];
        round.removeStack(
          Stack.Critical,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        log(
          `${event.source.owner.name}'s Critical stacks changed to ${event.amount}`,
        );
        event.source.stacks[Stack.Critical] = event.amount;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Critical`,
        );
        round.setStack(
          Stack.Critical,
          event.source,
          event.source.stacks[Stack.Critical] + event.amount,
        );
      }
    });

    round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Critical) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Critical`,
        );
        round.setStack(
          Stack.Critical,
          event.source,
          event.source.stacks[Stack.Critical] - event.amount,
        );
      }
    });
  });
}
