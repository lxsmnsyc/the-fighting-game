import { EventType, type Game, Stack } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { StackPriority } from '../priorities';

const MIN_LUCK_CHANCE = 0;
const MAX_LUCK_CHANCE = 100;
const MAX_LUCK_STACKS = 750;
const CONSUMABLE_LUCK_STACKS = 0.5;

export function getLuckChance(stack: number): number {
  return lerp(
    MIN_LUCK_CHANCE,
    MAX_LUCK_CHANCE,
    Math.min(stack / MAX_LUCK_STACKS, 1),
  );
}

export interface LuckData {
  chance: number;
  consumed: number;
  retained: number;
}

export function getLuckData(stack: number): LuckData {
  const consumable = (stack * CONSUMABLE_LUCK_STACKS) | 0;

  return {
    chance: getLuckChance(stack),
    consumed: consumable,
    retained: stack - consumable,
  };
}

export function setupLuckMechanics(game: Game): void {
  log('Setting up Luck mechanics.');
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
      log(`${event.target.name} lost ${event.amount} stacks of Luck`);
      game.setStack(
        Stack.Luck,
        event.target,
        event.target.stacks[Stack.Luck] - event.amount,
      );
    }
  });
}
