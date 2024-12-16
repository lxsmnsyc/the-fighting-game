import { lerp } from '../lerp';
import { log } from '../log';
import { StackPriority } from '../priorities';
import type { Round } from '../round';
import { RoundEventType, Stack } from '../types';

const MIN_LUCK_CHANCE = 0;
const MAX_LUCK_CHANCE = 100;
const MAX_LUCK_STACKS = 750;
const CONSUMABLE_STACKS = 0.5;

export function getLuckChance(stack: number): number {
  return lerp(
    MIN_LUCK_CHANCE,
    MAX_LUCK_CHANCE,
    Math.min(stack / MAX_LUCK_STACKS, 1),
  );
}

export function setupLuckMechanics(round: Round): void {
  log('Setting up Luck mechanics.');
  round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      const current = event.source.stacks[Stack.Luck];
      round.removeStack(
        Stack.Luck,
        event.source,
        Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
      );
    }
  });

  round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      log(`${event.source.owner.name}'s Luck changed to ${event.amount}`);
      event.source.stacks[Stack.Luck] = event.amount;
    }
  });

  round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      log(`${event.source.owner.name} gained ${event.amount} stacks of Luck`);
      round.setStack(
        Stack.Luck,
        event.source,
        event.source.stacks[Stack.Luck] + event.amount,
      );
    }
  });

  round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      log(`${event.source.owner.name} lost ${event.amount} stacks of Luck`);
      round.setStack(
        Stack.Luck,
        event.source,
        event.source.stacks[Stack.Luck] - event.amount,
      );
    }
  });
}
