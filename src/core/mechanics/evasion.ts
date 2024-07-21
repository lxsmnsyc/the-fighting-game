import { DamageType } from '../damage';
import { DamageFlags } from '../damage-flags';
import { EventType, type Game, Stack } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { DamagePriority, StackPriority } from '../priorities';

const MIN_EVASION_CHANCE = 0;
const MAX_EVASION_CHANCE = 100;
const MAX_EVASION_STACKS = 750;

const CONSUMABLE_STACKS = 0.5;

function getEvasionChance(stack: number): number {
  return lerp(
    MIN_EVASION_CHANCE,
    MAX_EVASION_CHANCE,
    Math.min(stack / MAX_EVASION_STACKS, 1),
  );
}

export function setupEvasionMechanics(game: Game): void {
  log('Setting up Evasion mechanics.');
  game.on(EventType.Damage, DamagePriority.Evasion, event => {
    if (event.flag & DamageFlags.Missed) {
      return;
    }
    // Check if player can evade it
    const stacks = event.target.stacks[Stack.Evasion];
    if (event.type === DamageType.Attack && stacks !== 0) {
      // If there's an evasion stack
      if (stacks > 0) {
        // Calculat evasion chance
        const currentEvasion = getEvasionChance(stacks);
        // Push your luck
        const random = Math.random() * 100;
        if (random > currentEvasion) {
          return;
        }
        log(`${event.target.name} dodged ${event.amount} of damage.`);
        event.flag |= DamageFlags.Missed;
      }

      game.consumeStack(Stack.Evasion, event.target);
    }
  });

  game.on(EventType.ConsumeStack, StackPriority.Exact, event => {
    if (event.type === Stack.Evasion) {
      const current = event.source.stacks[Stack.Evasion];
      game.removeStack(
        Stack.Evasion,
        event.source,
        Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
      );
    }
  });

  game.on(EventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Evasion) {
      log(`${event.source.name}'s Evasion changed to ${event.amount}`);
      event.source.stacks[Stack.Evasion] = event.amount;
    }
  });

  game.on(EventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Evasion) {
      log(`${event.source.name} gained ${event.amount} stacks of Evasion`);
      game.setStack(
        Stack.Evasion,
        event.source,
        event.source.stacks[Stack.Evasion] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Evasion) {
      log(`${event.source.name} lost ${event.amount} stacks of Evasion`);
      game.setStack(
        Stack.Evasion,
        event.source,
        event.source.stacks[Stack.Evasion] - event.amount,
      );
    }
  });
}
