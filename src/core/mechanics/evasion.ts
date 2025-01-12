import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
} from '../types';

const MIN_EVASION_CHANCE = 0;
const MAX_EVASION_CHANCE = 100;
const MAX_EVASION_STACKS = 750;

const CONSUMABLE_STACKS = 0.4;

function getEvasionChance(stack: number): number {
  return lerp(
    MIN_EVASION_CHANCE,
    MAX_EVASION_CHANCE,
    Math.min(stack / MAX_EVASION_STACKS, 1),
  );
}

export function setupEvasionMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Evasion mechanics.');
    round.on(RoundEvents.Damage, DamagePriority.Evasion, event => {
      if (event.flag & DamageFlags.Missed) {
        return;
      }
      // Check if player can evade it
      const stacks = event.target.stacks[Stack.Evasion];
      if (event.type === DamageType.Attack && stacks !== 0) {
        // If there's an evasion stack
        if (stacks === 0) {
          return;
        }
        // Calculat evasion chance
        const currentEvasion = getEvasionChance(stacks);
        // Push your luck
        const random = event.target.rng.random() * 100;
        if (random > currentEvasion) {
          return;
        }
        log(`${event.target.owner.name} dodged ${event.amount} of damage.`);
        event.flag |= DamageFlags.Missed;
        round.consumeStack(Stack.Evasion, event.target);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Evasion) {
        const current = event.source.stacks[Stack.Evasion];
        round.removeStack(
          Stack.Evasion,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Evasion) {
        log(`${event.source.owner.name}'s Evasion changed to ${event.amount}`);
        event.source.stacks[Stack.Evasion] = event.amount;
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Evasion) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Evasion`,
        );
        round.setStack(
          Stack.Evasion,
          event.source,
          event.source.stacks[Stack.Evasion] + event.amount,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Evasion) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Evasion`,
        );
        round.setStack(
          Stack.Evasion,
          event.source,
          event.source.stacks[Stack.Evasion] - event.amount,
        );
      }
    });
  });
}
