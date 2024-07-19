import { DamageType, EventType, type Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { BuffPriority, DamagePriority, DebuffPriority } from '../priorities';

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
    if (event.type === DamageType.Attack && event.source.criticalStacks !== 0) {
      // If there's a critical stack
      if (event.source.criticalStacks > 0) {
        // Calculat critical chance
        const currentCriticalChance = getCriticalChance(
          event.source.criticalStacks,
        );
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentCriticalChance) {
          event.amount *= event.source.critMultiplier;
          log(`${event.target.name} triggered a ${event.amount} of critical.`);
          event.flags.critical = true;

          const consumable =
            (event.target.criticalStacks * CONSUMABLE_CRITICAL_STACKS) | 0;
          game.triggerDebuff(
            EventType.RemoveCritical,
            event.source,
            event.target,
            consumable,
          );
        }
      } else {
        const consumable =
          (event.target.criticalStacks * CONSUMABLE_CRITICAL_STACKS) | 0;
        game.triggerBuff(EventType.AddCritical, event.source, -consumable);
      }
    }
  });

  game.on(EventType.AddSpeed, BuffPriority.Exact, event => {
    event.source.criticalStacks += event.amount;
  });

  game.on(EventType.RemoveSpeed, DebuffPriority.Exact, event => {
    event.target.criticalStacks -= event.amount;
  });
}
