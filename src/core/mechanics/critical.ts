import { DamageType } from '../damage';
import { DamageFlags } from '../damage-flags';
import { type Game, RoundEventType, Stack, Stat } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { DamagePriority, StackPriority, StatPriority } from '../priorities';

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
  log('Setting up Critical mechanics.');
  game.on(RoundEventType.Damage, DamagePriority.Critical, event => {
    if (event.flag & (DamageFlags.Missed | DamageFlags.Critical)) {
      return;
    }
    // Check if player can crit
    const stacks = event.source.stacks[Stack.Critical];
    if (
      (event.type === DamageType.Attack ||
        event.type === DamageType.Physical) &&
      stacks !== 0
    ) {
      // If there's a critical stack
      if (stacks > 0) {
        // Calculat critical chance
        const currentCriticalChance = getCriticalChance(stacks);
        // Push your luck
        const random = Math.random() * 100;
        if (random > currentCriticalChance) {
          return;
        }
        event.amount *= event.source.stats[Stat.CritMultiplier] / 100;
        log(`${event.source.name} triggered a ${event.amount} of critical.`);
        event.flag |= DamageFlags.Critical;
      }

      game.consumeStack(Stack.Critical, event.target);
    }
  });

  game.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      const current = event.source.stacks[Stack.Critical];
      game.removeStack(
        Stack.Critical,
        event.source,
        Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
      );
    }
  });

  game.on(RoundEventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      log(`${event.source.name}'s Critical stacks changed to ${event.amount}`);
      event.source.stacks[Stack.Critical] = event.amount;
    }
  });

  game.on(RoundEventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      log(`${event.source.name} gained ${event.amount} stacks of Critical`);
      game.setStack(
        Stack.Critical,
        event.source,
        event.source.stacks[Stack.Critical] + event.amount,
      );
    }
  });

  game.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      log(`${event.source.name} lost ${event.amount} stacks of Critical`);
      game.setStack(
        Stack.Critical,
        event.source,
        event.source.stacks[Stack.Critical] - event.amount,
      );
    }
  });

  log('Setting up Critical Multiplier mechanics.');
  game.on(RoundEventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.CritMultiplier) {
      log(
        `${event.source.name}'s Critical Multiplier changed to ${event.amount}`,
      );
      event.source.stats[Stat.CritMultiplier] = Math.max(0, event.amount);
    }
  });

  game.on(RoundEventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.CritMultiplier) {
      log(`${event.source.name} gained ${event.amount} of Critical Multiplier`);
      game.setStat(
        Stat.CritMultiplier,
        event.source,
        event.source.stats[Stat.CritMultiplier] + event.amount,
      );
    }
  });

  game.on(RoundEventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.CritMultiplier) {
      log(`${event.source.name} lost ${event.amount} of Critical Multiplier`);
      game.setStat(
        Stat.CritMultiplier,
        event.source,
        event.source.stats[Stat.CritMultiplier] - event.amount,
      );
    }
  });
}
