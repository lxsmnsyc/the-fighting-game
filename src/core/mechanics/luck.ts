import { EventType, type Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { BuffPriority, DebuffPriority } from '../priorities';

const MIN_CRITICAL_CHANCE = 0;
const MAX_CRITICAL_CHANCE = 100;
const MAX_CRITICAL_STACKS = 750;
const CONSUMABLE_LUCK_STACKS = 0.5;

export function getLuckChance(stack: number): number {
  return lerp(
    MIN_CRITICAL_CHANCE,
    MAX_CRITICAL_CHANCE,
    Math.min(stack / MAX_CRITICAL_STACKS, 1),
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
  game.on(EventType.AddLuck, BuffPriority.Exact, event => {
    log(`${event.source.name} gained ${event.amount} stacks of Luck`);
    event.source.luckStacks += event.amount;
  });

  game.on(EventType.RemoveLuck, DebuffPriority.Exact, event => {
    log(`${event.target.name} lost ${event.amount} stacks of Luck`);
    event.target.luckStacks -= event.amount;
  });
}
