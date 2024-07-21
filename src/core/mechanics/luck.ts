import { EventType, type Game, Stack } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { StackPriority } from '../priorities';

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

export function setupLuckMechanics(game: Game): void {
  log('Setting up Luck mechanics.');
  game.on(EventType.ConsumeStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      const current = event.source.stacks[Stack.Luck];
      game.removeStack(
        Stack.Luck,
        event.source,
        Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
      );
    }
  });

  game.on(EventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      log(`${event.source.name}'s Luck changed to ${event.amount}`);
      event.source.stacks[Stack.Luck] = event.amount;
    }
  });

  game.on(EventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      log(`${event.source.name} gained ${event.amount} stacks of Luck`);
      game.setStack(
        Stack.Luck,
        event.source,
        event.source.stacks[Stack.Luck] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Luck) {
      log(`${event.source.name} lost ${event.amount} stacks of Luck`);
      game.setStack(
        Stack.Luck,
        event.source,
        event.source.stacks[Stack.Luck] - event.amount,
      );
    }
  });
}
