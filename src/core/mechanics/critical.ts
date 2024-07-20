import { DamageType, EventType, type Game, Stack, Stat } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { DamagePriority, StackPriority, StatPriority } from '../priorities';

const MIN_CRITICAL_CHANCE = 0;
const MAX_CRITICAL_CHANCE = 100;
const MAX_CRITICAL_STACKS = 750;
const CONSUMABLE_CRITICAL_STACKS = 0.5;

function getCriticalChance(stack: number): number {
  return lerp(
    MIN_CRITICAL_CHANCE,
    MAX_CRITICAL_CHANCE,
    Math.min(stack / MAX_CRITICAL_STACKS, 1),
  );
}

export function setupCriticalMechanics(game: Game): void {
  log('Setting up Critical mechanics.');
  game.on(EventType.Damage, DamagePriority.Critical, event => {
    if (event.flags.missed || event.flags.critical) {
      return;
    }
    // Check if player can crit
    if (
      event.type === DamageType.Attack &&
      event.source.stacks[Stack.Critical] !== 0
    ) {
      // If there's a critical stack
      if (event.source.stacks[Stack.Critical] > 0) {
        // Calculat critical chance
        const currentCriticalChance = getCriticalChance(
          event.source.stacks[Stack.Critical],
        );
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentCriticalChance) {
          event.amount *= event.source.stats[Stat.CritMultiplier] / 100;
          log(`${event.target.name} triggered a ${event.amount} of critical.`);
          event.flags.critical = true;

          const consumable =
            (event.source.stacks[Stack.Critical] * CONSUMABLE_CRITICAL_STACKS) |
            0;
          game.removeStack(
            Stack.Critical,
            event.source,
            event.target,
            consumable,
          );
        }
      } else {
        const consumable =
          (event.source.stacks[Stack.Critical] * CONSUMABLE_CRITICAL_STACKS) |
          0;
        game.addStack(Stack.Critical, event.source, -consumable);
      }
    }
  });

  game.on(EventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      log(`${event.source.name}'s Critical stacks changed to ${event.amount}`);
      event.source.stacks[Stack.Critical] = event.amount;
    }
  });

  game.on(EventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      log(`${event.source.name} gained ${event.amount} stacks of Critical`);
      game.setStack(
        Stack.Critical,
        event.source,
        event.source.stacks[Stack.Critical] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Critical) {
      log(`${event.target.name} lost ${event.amount} stacks of Critical`);
      game.setStack(
        Stack.Critical,
        event.target,
        event.target.stacks[Stack.Critical] - event.amount,
      );
    }
  });

  log('Setting up Critical Multiplier mechanics.');
  game.on(EventType.SetStat, StatPriority.Exact, event => {
    if (event.type === Stat.CritMultiplier) {
      log(
        `${event.source.name}'s Critical Multiplier changed to ${event.amount}`,
      );
      event.source.stats[Stat.CritMultiplier] = Math.max(0, event.amount);
    }
  });

  game.on(EventType.AddStat, StatPriority.Exact, event => {
    if (event.type === Stat.CritMultiplier) {
      log(`${event.source.name} gained ${event.amount} of Critical Multiplier`);
      game.setStat(
        Stat.CritMultiplier,
        event.source,
        event.source.stats[Stat.CritMultiplier] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStat, StatPriority.Exact, event => {
    if (event.type === Stat.CritMultiplier) {
      log(`${event.target.name} lost ${event.amount} of Critical Multiplier`);
      game.setStat(
        Stat.CritMultiplier,
        event.target,
        event.target.stats[Stat.CritMultiplier] - event.amount,
      );
    }
  });
}
