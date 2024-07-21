import { DamageType, EventType, type Game, Stack } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { DamagePriority, StackPriority } from '../priorities';

const MIN_EVASION_CHANCE = 0;
const MAX_EVASION_CHANCE = 100;
const MAX_EVASION_STACKS = 750;
const CONSUMABLE_EVASION_STACKS = 0.5;

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
    if (event.flags.missed) {
      return;
    }
    // Check if player can evade it
    if (
      event.type === DamageType.Attack &&
      event.target.stacks[Stack.Evasion] !== 0
    ) {
      // If there's an evasion stack
      if (event.target.stacks[Stack.Evasion] > 0) {
        // Calculat evasion chance
        const currentEvasion = getEvasionChance(
          event.target.stacks[Stack.Evasion],
        );
        // Push your luck
        const random = Math.random() * 100;
        if (random > currentEvasion) {
          return;
        }
        log(`${event.target.name} dodged ${event.amount} of damage.`);
        event.flags.missed = true;
      }

      game.removeStack(
        Stack.Evasion,
        event.source,
        event.target.stacks[Stack.Evasion] * CONSUMABLE_EVASION_STACKS,
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
